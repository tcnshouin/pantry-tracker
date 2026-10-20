# Pantry Tracker

A web application for tracking food pantry inventory by category, monitoring
expiration dates, and generating grocery lists from low-stock and out-of-stock
items. Scope is **pantry-stored food only** — no refrigerated or frozen items.

This README is the build specification. It is written to be followed **in order,
one phase at a time**. Do not skip ahead, and do not start writing code before
completing Phase 0.

---

## How to use this document (for Claude Code)

1. Work through the phases sequentially. Each phase is self-contained and ends
   with a checklist. Do not begin a phase until the previous one's checklist
   passes.
2. Keep each phase to its stated scope. If something feels like it belongs to a
   later phase, leave a `// TODO(phase-N)` marker and move on rather than pulling
   the work forward. This keeps each working session bounded.
3. After finishing a phase, stop and summarize what was built and what the next
   phase requires before continuing.
4. Never hardcode secrets (DB passwords, keys). Read them from environment
   variables / `application.properties` placeholders from the very first commit.

---

## Phase 0 — Dependency verification (do this before writing any code)

**This phase is mandatory and produces no application code.** Its only job is to
confirm the toolchain and lock versions, so nothing downstream breaks on a stale
version number.

**Status: COMPLETE.** See the [Resolved versions](#resolved-versions) and
[Phase 0 changelog](#phase-0-changelog) sections at the bottom.

Recommended targets (as of the original writing — verify, do not assume):

| Component      | Recommended        | Notes                                              |
| -------------- | ------------------ | -------------------------------------------------- |
| Java           | 21 (LTS)           | Widest tutorial/support base. 25 LTS also fine.    |
| Spring Boot    | 3.5.x              | Mature 3.x line, best Thymeleaf + Security docs.   |
| PostgreSQL     | 16 or newer        | 42.7.x JDBC driver.                                |
| Build tool     | Maven              | Gradle acceptable if preferred.                    |
| Thymeleaf      | (bundled w/ Boot)  | via `spring-boot-starter-thymeleaf`.               |

**Verification steps — complete every one before Phase 1:**

- [x] Run `java -version` and confirm the installed JDK is 21 (or the chosen LTS).
- [x] Confirm the latest patch of the chosen Spring Boot line at
      <https://start.spring.io> (Spring Initializr) rather than trusting the
      number above. Pin whatever Initializr currently offers.
- [x] Confirm PostgreSQL is installed and reachable (`psql --version`), or plan
      to add it in Phase 6 (containerization). A local install is enough to start.
- [x] Generate the project skeleton from Spring Initializr with these starters:
      `web`, `thymeleaf`, `data-jpa`, `security`, `validation`, plus the
      `postgresql` driver and `flyway`. Add `lombok` and `spring-boot-devtools`
      as development conveniences.
- [x] Confirm the generated project builds and runs (`./mvnw spring-boot:run`)
      against an empty database before adding any features.
- [x] Record the exact resolved versions in this README's changelog section at
      the bottom, so the next session inherits the locked set.

---

## Tech stack (confirmed)

- **Language:** Java 25 (LTS)
- **Framework:** Spring Boot 4.0.x
- **Frontend:** Thymeleaf server-rendered templates + Thymeleaf Layout Dialect
  for a shared base layout. Bootstrap 5 (via CDN) for styling. HTMX (via CDN)
  for partial updates (delete-without-reload, inline batch edits, filtering).
  Chart.js (via CDN) optional, for dashboard stats.
- **Persistence:** Spring Data JPA over **PostgreSQL**.
- **Migrations & seed data:** Flyway (versioned SQL, runs on startup).
- **Auth:** Spring Security with session-based login (form login), passwords
  hashed with `BCryptPasswordEncoder`. JWT is intentionally **not** used — the
  app is server-rendered with no separate API client.
- **Build:** Maven.
- **Containerization:** Docker + Docker Compose — added last (Phase 6), not
  required during feature development.
- **Testing:** JUnit 5 + Mockito via the modular Spring Boot 4 `*-test` starters
  (`spring-boot-starter-webmvc-test`, `-data-jpa-test`, `-security-test`, etc.).

---

## Color scheme

User-supplied palette. All four are mid-to-light in tone, so text colors are
specified separately to keep contrast readable.

| Role                                   | Hex        |
| -------------------------------------- | ---------- |
| Primary accent (buttons, links, active)| `#DB9558`  |
| Page background (cream base)           | `#FCF9EA`  |
| Fresh / in-stock status, 2nd accent    | `#97A87A`  |
| Card surfaces, muted borders, fills    | `#A8BBA3`  |
| Primary text (added — for contrast)    | `#3A342B`  |
| Warning / expiring / out-of-stock      | `#C0562F`  |

`#3A342B` (charcoal) and `#C0562F` (terracotta) are additions, not part of the
supplied four: no palette color passes contrast as body text on the cream
background, and the palette has no warning color. The terracotta is tuned to
harmonize with the caramel accent rather than clash.

Define these as CSS custom properties in the base layout so every template and
HTMX fragment inherits them.

---

## Data model

Two-level inventory model: an **Item** is the canonical product; a **Batch** is
one physical instance added on a given date. This is what lets two cartons of the
same product bought on different dates keep separate expiration dates.

```
User(id, email, password_hash, created_at)

LocationGroup(id, user_id, name, created_at)
    -- user-created pantry storage areas (e.g. "Pantry shelf", "Basement shelf")
    -- name is unique per user, case-insensitive

Category(id, name)
    -- fixed seeded list (see Category seed data below)

CategoryExpiryReference(id, category_id, lower_bound_shelf_life_days, source_note)
    -- pantry-only shelf-life estimates, lower bound of the realistic range

Item(id, user_id, name, category_id, location_group_id,
     low_stock_enabled, low_stock_threshold,
     purge_override, empty_since, created_at, updated_at)
    -- name normalized (lowercased, trimmed) for duplicate detection
    -- purge_override = true disables auto-purge for this item

Batch(id, item_id, quantity, expiration_date, auto_expiry,
      purge_override, empty_since, date_added)
    -- auto_expiry = true means expiration_date was auto-calculated
    -- purge_override = true disables auto-purge for this batch
    -- empty_since = timestamp quantity first hit 0 (null if not empty)

GroceryListItem(id, user_id, item_name, quantity_needed, source, created_at)
    -- source = 'AUTO' (low/out of stock) or 'MANUAL' (added by user)
    -- purchased flag toggled when checked off
```

**Indexing notes (relevant to the DSA objectives):**
- Composite index on `Batch(item_id, expiration_date)` — supports "earliest
  expiring batch per item" queries.
- Composite index on `Item(user_id, location_group_id)` — supports grouped view.
- Index on `Item(user_id, name)` — supports duplicate detection lookup.

---

## Business rules

These are the app's non-obvious logic. Implement them in the service layer with
unit tests, not scattered through controllers.

### Expiration calculation
- When a batch is added with **auto-calculate on**:
  `expiration_date = date_added + lower_bound_shelf_life_days` for the item's
  category. Toggling auto-calculate off makes the date field manually editable.
- If a category has no reference row, surface an inline note and require a manual
  date rather than leaving it blank.

### Freshness status (computed at query time, never stored)
- `expired` — expiration_date is in the past
- `expiring soon` — within N days (configurable, default 7)
- `fresh` — otherwise
- An item's rolled-up status reflects its **earliest-expiring batch** (worst case
  first), so the user sees the most urgent thing to act on.

### Low-stock alerts (per item, toggleable)
- `low_stock_enabled = false` by default. When off, only the absolute out-of-stock
  state applies.
- When on, once total quantity across batches drops to or below
  `low_stock_threshold`, the item is flagged **Low stock** and auto-added to the
  grocery list with `source = 'AUTO'`.
- **Anti-spam rule:** once auto-suggested, an item is not re-added until it is
  either purchased/removed from the list, or its quantity rises back above the
  threshold and drops again. (This solves the "stays at 1 forever" case.)

### Out of stock
- When an item's total quantity reaches 0, the item is flagged **Out of stock**
  and always auto-added to the grocery list, regardless of the low-stock toggle.
- Quantity may never go below 0 — block decrement-below-zero at the UI and
  validate server-side.

### Auto-purge (two levels, both overridable)
- **Item-level:** an item sitting at zero stock with **no updates for 7 days** is
  purged. Any edit (restock, batch adjustment) resets the 7-day clock via
  `updated_at` / `empty_since`.
- **Batch-level:** after an item is purged/deleted, a leftover empty batch tied to
  it that stays empty for **3 more days** is then deleted.
- **Overrides:** `purge_override` exists independently on both Item and Batch
  (most granular). When set, that record is exempt from auto-purge and stays
  listed (item shows "Out of stock" indefinitely).
- Implement the sweep as a scheduled task (`@Scheduled`) that runs daily, checks
  `empty_since` against the thresholds, and skips any record with
  `purge_override = true`.

### Duplicate detection (on add)
- Match on `(normalized name, category_id, location_group_id, user_id)`.
- On match, prompt the user: **add as new batch** or **edit an existing batch**
  (with a picker of that item's batches by date added). Never silently merge.

### Grocery list → inventory loop
- Checking a grocery item off marks it purchased (struck through), then opens a
  pre-filled "add batch" prompt using that item's name and purchased quantity,
  defaulting to the auto-calculated expiry. This is what returns items to
  inventory instead of the list being a dead end.

---

## Data structures & algorithms (project objective)

Implement these explicitly in the service layer so they can be pointed to in the
report, rather than leaving everything to the ORM.

- **HashMap** — O(1) average duplicate-detection lookup keyed by normalized
  `(name, category, location)` before insert.
- **Insertion sort** — keep each item's batch list sorted by `expiration_date`.
  Correct choice here because a single item's batch list is small and nearly
  sorted, which is insertion sort's best case; slot the new batch in by walking
  backward rather than re-sorting the whole list.
- **Stack (LIFO)** — per-session undo stack for add/edit/delete actions. Each
  action pushes a state snapshot; "Undo" pops and reverses the most recent.
- **Min-heap / priority queue** — surface the earliest-expiring batch per item in
  O(1) peek for the "expiring soon" dashboard list and status roll-up.
- **B-tree indexing** — discuss the composite indexes above as the database's own
  structure for efficient expiration and grouping queries.

---

## Features by build phase

Each phase below is a bounded unit of work with an entry condition (previous
phase done) and an exit checklist. Build in this order.

### Phase 1 — Auth + skeleton
- User registration and login (Spring Security form login, BCrypt hashing).
- Base Thymeleaf layout with the color scheme, nav shell, and shared fragments.
- Logged-in landing page (empty dashboard placeholder).
- Flyway migration `V1` creating `User`.
- **Exit:** a user can register, log in, log out; unauthenticated requests to app
  pages redirect to login; CSRF works on all forms (`th:action`).

### Phase 2 — Categories + expiry reference (seed data)
- Flyway migration `V2` creating `Category` and `CategoryExpiryReference`, seeded
  from the Category seed data table below.
- Category dropdown component with a working search/filter (client-side filter
  over the seeded list is fine for a fixed list).
- **Exit:** categories load in a searchable dropdown; each has a shelf-life value.

### Phase 3 — Location groups + inventory (grouped view)
- `LocationGroup` CRUD, including the **New group** creator (name + create).
  Group name unique per user, case-insensitive. Block deleting a non-empty group
  (require reassign/empty first).
- `Item` and `Batch` entities + Flyway migration `V3`.
- Add / edit / remove items with the Item + Batch model.
- Grouped-by-location inventory view: collapsible location sections, each item row
  independently expandable (own chevron) to reveal editable batch history
  (date added, quantity, expiration per batch).
- Duplicate detection prompt on add (new batch vs edit existing).
- Quantity stepper with decrement-below-zero blocked.
- **Exit:** items can be created under groups, batches added/edited inline, and
  duplicate adds prompt correctly.

### Phase 4 — Expiry engine + freshness + low stock
- Auto-calculate expiration from category reference, with a per-item/per-batch
  toggle for manual override.
- Freshness status computed at query time, color-coded; earliest-batch roll-up.
- Per-item low-stock toggle + threshold input.
- Out-of-stock detection.
- **Exit:** expiry auto-fills and is overridable; statuses render with correct
  colors; low-stock and out-of-stock flags fire per the business rules.

### Phase 5 — Grocery list + dashboard + purge
- **Add to grocery list** button (asks for quantity on add).
- Grocery list dashboard: **Suggested (low/out of stock)** section and **Added by
  you** section, each with quantity; check-off marks purchased and opens the
  pre-filled add-batch prompt (the inventory loop).
- Auto-suggestion with the anti-spam rule.
- Main dashboard: total items, expiring-this-week count, low-stock count,
  by-location breakdown, grocery suggestions, expiring-soon list.
- Auto-purge scheduled task (7-day item / 3-day batch) honoring both overrides,
  with visible countdown flags and inline "Keep item" / "Keep batch" controls.
- Undo stack for add/edit/delete with an "Undo" toast.
- **Exit:** items flow to the grocery list and back into inventory; dashboard
  reflects live state; purge task runs and respects overrides; undo works.

### Phase 6 — Packaging + polish
- Empty states for zero-item dashboard and inventory.
- Docker + Docker Compose (app + PostgreSQL) — `docker-compose up` runs the whole
  stack. Externalized config already in place from Phase 0.
- Basic profile/settings page (change password).
- Test pass: service-layer unit tests for expiry calc, low-stock, purge logic,
  duplicate detection; secured-controller tests.
- **Exit:** `docker-compose up` brings up a working app against a fresh DB;
  core service logic is covered by tests.

---

## Category seed data (pantry-only)

Shelf-life values are the **lower bound** of the realistic range, to warn early
rather than late. `source_note` should cite general public food-safety guidance
(e.g. USDA FoodSafety.gov) — do not invent precise numbers beyond this table.

| Category                              | Range (days) | Stored (lower bound) |
| ------------------------------------- | ------------ | -------------------- |
| Canned goods (vegetables, beans, soup)| 730–1,825    | 730                  |
| Pasta, dry                            | 365–730      | 365                  |
| Rice, white                           | 1,460–1,825  | 730                  |
| Cereal, unopened                      | 180–365      | 180                  |
| Crackers / biscuits                   | 60–270       | 60                   |
| Bread (pantry-stored)                 | 3–7          | 3                    |
| Flour, all-purpose                    | 180–365      | 180                  |
| Sugar, granulated                     | 730+         | 730                  |
| Cooking oil                           | 365–730      | 365                  |
| Peanut butter, unopened               | 180–730      | 180                  |
| Coffee, ground, unopened              | 90–270       | 90                   |
| Dried beans / lentils                 | 365–1,095    | 365                  |
| Spices, ground                        | 730–1,095    | 730                  |
| Instant noodles                       | 60–240       | 60                   |
| Condiments / sauces, unopened         | 365–545      | 365                  |

---

## Scope guardrails

In scope: pantry-stored food items, single user per account, manual logging,
category-based expiry estimates with manual override.

Out of scope (do not build): refrigerated/frozen item handling, multi-user or
shared-household sync, offline mode, external grocery/e-commerce integration,
per-brand expiry validation, automatic partial-consumption detection.

---

## Conventions

- Use `LocalDate` (not `LocalDateTime`) for expiration dates — avoids midnight
  timezone bugs.
- Thymeleaf forms use `th:action` so Spring Security's CSRF token is included.
- Paginate or lazy-load the grouped inventory view per group; do not render an
  unbounded item list.
- Sentence case for all UI labels and buttons; verb-first CTAs ("Add item",
  "Create group", "Add to list").
- Keep secrets in environment variables from the first commit.

---

## Running the app

> **Update (2026-10-20): the app now runs purely on Supabase.** All data lives in a
> Supabase Postgres database and logins use Supabase Auth (email + password, with
> email confirmation and password reset). There is no local database and no
> users table or password hashing of our own. Sections above that mention form
> login, BCrypt, the `User` table or the grocery "purchased" flag describe the
> original spec. The grocery page now uses checkboxes + **Put away** instead.

1. Set up a Supabase project and your `.env` file: **[SUPABASE-SETUP.md](SUPABASE-SETUP.md)**.
2. Run natively (JDK 25):

   ```bash
   ./mvnw spring-boot:run
   ```

   or with Docker (reads the same `.env`):

   ```bash
   docker compose up --build
   ```

3. Open <http://localhost:8080>, create an account, confirm the email, log in.

| Variable            | What it is                                        |
| ------------------- | ------------------------------------------------- |
| `SUPABASE_URL`      | Project URL, `https://<ref>.supabase.co`          |
| `SUPABASE_ANON_KEY` | Publishable / anon key (never the service key)    |
| `DB_URL`            | Session pooler JDBC URL with `?sslmode=require`   |
| `DB_USERNAME`       | `postgres.<ref>`                                  |
| `DB_PASSWORD`       | The project's database password                   |

Tests: `./mvnw test`. The database tests run only when `.env` is present.

---

## Resolved versions

Exact versions locked at Phase 0 (2026-09-22), so future sessions inherit them:

- **Java:** 25.0.1 (Temurin/OpenJDK; `<java.version>25</java.version>`)
- **Spring Boot:** 4.0.8
- **PostgreSQL:** 16.15 (verified against `postgres:16` container; target "16 or newer")
- **PostgreSQL JDBC driver:** 42.7.13 (managed by Spring Boot 4.0.8)
- **Flyway:** 11.14.1 (`flyway-core` + `flyway-database-postgresql`)
- **Build tool:** Maven (wrapper `mvnw`), Maven 3.9.14 on host

### Phase 0 changelog

- **Spring Boot line changed from the originally-specified 3.5.x to 4.0.8.**
  As of 2026-09-22, Spring Initializr no longer offers the 3.5.x line — its
  stable options start at Spring Boot 4.0.x, and 3.5.x is past its free OSS
  support horizon. Locked 4.0.8 (latest stable GA Initializr offers), on the
  user's decision, to stay on a supported line. Java 25 is fully supported.
- **Spring Boot 4 starter layout differences to note for later phases:**
  - `spring-boot-starter-web` is now `spring-boot-starter-webmvc`.
  - Flyway comes via `spring-boot-starter-flyway`; `flyway-database-postgresql`
    is included for Postgres support.
  - The monolithic `spring-boot-starter-test` is replaced by modular per-slice
    test starters (`spring-boot-starter-webmvc-test`, `-data-jpa-test`,
    `-security-test`, `-thymeleaf-test`, `-validation-test`, `-flyway-test`).
    `spring-security-test` functionality lives in `spring-boot-starter-security-test`.
  - `thymeleaf-extras-springsecurity6` is included for security-aware templates.
- **Verification performed:** `./mvnw package` succeeds (executable jar built);
  app boots against an empty `postgres:16` database — Hikari pool starts, Flyway
  connects and validates 0 migrations (expected; no `V1` yet), Tomcat starts on
  8080, "Started PantryTrackerApplication".
- **Not yet installed locally:** `psql` / a local PostgreSQL. Runtime Postgres is
  supplied via Docker for now; Docker Compose is formalized in Phase 6.
