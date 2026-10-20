# Pantry Tracker — Developer Handoff

A short guide for the next developer: what you need installed, how to get and
run the project, where things live, and what's still left to build.

- **Repository:** `https://github.com/tcnshouin/pantry-tracker`
- **Branch:** `main`
- **Project root:** the repository root (no subfolder)
- **Stack:** Java 25 · Spring Boot 4.0.8 · Thymeleaf + HTMX + Bootstrap 5 ·
  Spring Data JPA · Supabase (hosted Postgres + Supabase Auth) · Flyway · Maven

> This repository was split out of the original group repo
> (`Rarityl/DLSL---Computer-Engineering---1st-Year`, branch
> `claude/pantry-tracker-phase-0-7832d2`, folder `pantry-tracker/`). The full
> commit history came with it; the other projects in that repo did not.

---

## 1. What you need installed

- **Git**, to clone the repo.
- **A Supabase project + `.env` file.** All data and logins live in Supabase;
  there is no local database. Follow **[SUPABASE-SETUP.md](SUPABASE-SETUP.md)** once,
  or get the `.env` file privately from a teammate who already did.
- Then **one** of:
  - **JDK 25** (Temurin/OpenJDK 25), checked with `java -version`. Maven isn't
    needed because the project ships the wrapper (`mvnw`).
  - **Docker Desktop**, if you'd rather not install Java.

If the repository is private, ask the owner (**tcnshouin**) to add you under
**Settings → Collaborators** before cloning.

---

## 2. Get the code

```bash
git clone https://github.com/tcnshouin/pantry-tracker.git
cd pantry-tracker
```

That's it — the project files are at the top level of the repo.

---

## 3. Run it

Make sure `.env` is in the project folder (see section 1), then:

```bash
./mvnw spring-boot:run
```
On Windows: `.\mvnw.cmd spring-boot:run`. Or with Docker: `docker compose up --build`
(it reads the same `.env`; rebuild after code changes).

Open <http://localhost:8080>, click **Create one**, confirm the email from
Supabase, and log in. **Forgot password?** on the login page sends a reset link.

### Run the tests
```bash
./mvnw test
```
The suite has **35 tests**. Unit and page tests run anywhere. The 3 database tests
(`RepositoryTest`, `PantryTrackerApplicationTests`) run against Supabase only
when `.env` is present and are skipped otherwise. They roll back their changes.

> Config is externalized: the app reads `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
> `DB_URL`, `DB_USERNAME` and `DB_PASSWORD` from `.env` (or real environment
> variables). Nothing secret is in Git. If startup fails with
> `'url' must start with "jdbc"`, the `.env` file is missing or not in the
> project folder.

### Looking at the database
Open your project at <https://supabase.com/dashboard>:
**Table Editor** to browse rows, **SQL Editor** to run queries, and
**Authentication → Users** for accounts.

---

## 4. Where things are (project map)

```
pantry-tracker/                      (repo root)
├── Dockerfile, docker-compose.yml   # containerized run (app only, reads .env)
├── .env.example                     # the 5 settings to copy into your own .env
├── SUPABASE-SETUP.md                # one-time Supabase project setup
├── README.md                        # full build spec + phase log
├── DATABASE-CHANGES.md              # how to change the schema (Flyway V5, V6, …)
├── src/main/java/com/pantry/tracker/
│   ├── config/      # AppConfig: security rules, layout dialect
│   ├── model/       # entities (Category, Item, Batch, LocationGroup,
│   │                #   GroceryListItem), SupabaseUser + Views.java (status enums, view
│   │                #   records, "Expiring in N days" wording)
│   ├── repository/  # Spring Data repositories
│   ├── service/     # InventoryService (most rules), GroceryService,
│   │                #   SupabaseAuthClient (login/sign-up/reset via Supabase),
│   │                #   UserService (current user's id),
│   │                #   DataStructures.java (the 4 required data structures)
│   └── web/         # HomeController, GroceryController, CategoryController,
│                    #   AuthController
├── src/main/resources/
│   ├── application.properties   # reads the .env settings
│   ├── db/migration/            # Flyway V1–V5 (schema, seed categories, Supabase switch)
│   └── templates/               # Thymeleaf pages + HTMX fragments
│       ├── layout.html          #   title bar, ☰ menu, ALL colors/CSS, page JS
│       ├── home.html            #   home page + left panel
│       ├── grocery/             #   grocery page (summary, quick add, put away)
│       ├── auth/                #   login, register, forgot/reset password
│       └── inventory/fragments.html  # item rows, steppers, menus, undo toast
└── tasks/todo.md                # per-phase checklists, decisions, deferrals
```

**Rule of thumb:** to change how something *looks*, edit `templates/` (colors
are CSS variables at the top of `layout.html`). To change how something
*behaves*, edit `service/` (rules) or `web/` (what each URL/button does).

---

## 5. Where development stopped (status)

**Core features (done):**
- Auth through **Supabase Auth**: register (with email confirmation), login,
  logout, forgot/reset password. CSRF on every form.
- All data in a **Supabase** Postgres database; tables locked with Row Level Security.
- Categories with seeded shelf-life reference (searchable dropdown).
- Locations + two-level inventory (Item = product, Batch = dated purchase),
  duplicate detection.
- Expiry auto-calculation and freshness status: fresh / expiring soon /
  **expires today** / expired; low-stock and out-of-stock flags.
- Grocery list: auto-suggests low/out-of-stock items, manual add (🛒 on an item
  or **Quick add**), inline − / + quantity, and **Put away**: tick what you
  bought and it is added to inventory as new batches with auto-calculated expiry.
- Auto-purge sweep (7-day item / 3-day batch) with Keep overrides.
- Per-session undo stack.
- Docker Compose packaging (app only; the database is Supabase).

**Home page (current design):**
- Fresh market color scheme (green actions, mint title bar, white cards on a
  light yellow page). Colors meet WCAG AA contrast.
- ☰ slide-out navigation (hover or click) to Home / Grocery / Categories.
- Full-height left panel that stays in place, each card scrolling on its own:
  - **By location** — pick which location is shown, with 🔍 search and ＋ add.
  - **Expiring soon** — click an entry to jump to that item (it flashes).
- One location's inventory shown at a time; the choice is remembered.
- Item rows: − / + quantity stepper (− uses the soonest-expiring batch first,
  + adds to the newest), "N batches" toggle, 🛒 add-to-grocery menu with its own
  quantity picker, ⋯ menu for edit/delete. Badges appear only when something
  needs attention.
- Single undo pop-up (bottom right) instead of inline undo buttons.

**Grocery page:**
- Same layout as Home. The left panel holds **Shopping summary** (items, units,
  suggested vs. added), **Quick add** (searchable pantry items not on the list),
  and **Recently stocked** (last 8 batches added). It refreshes with every action.
- One merged list with Suggested / Added tags, checkboxes, **Select all**, and
  **Put away (N)**.

**Required data structures (for the report)** — all in `service/DataStructures.java`:
- **HashMap** — duplicate detection (`DuplicateIndex`).
- **Insertion sort** — batch ordering by expiry (`insertSorted`).
- **Min-heap / PriorityQueue** — the "Expiring soon" list (`ExpiringSoonHeap`).
- **Stack (LIFO)** — undo (`UndoStack`, kept in the user's session).
- **B-tree indexes** — the composite/functional DB indexes in the Flyway migrations.

---

## 6. What's still missing (your TODO)

From the latest design review (small, high-value first):
1. **Make the counts agree** — "Expiring this week" counts only expiring-soon and
   expires-today batches, while the Expiring soon panel also lists expired ones.
   Rename it to "Needs attention" and count everything, or show expired separately.
2. **Duplicate names in Expiring soon** — the panel lists batches, so one item can
   appear twice. Show quantities (e.g. "Bread Pan ×3") or merge per item.
3. **Screen-reader labels** — add the item name to the −, +, 🛒 and ⋯ button
   labels (e.g. `aria-label="Remove one Bread Pan"`).
4. **Flag locations that need attention** — a warning dot/count next to each
   location in the By location list.
5. **Make the stat boxes filters** — clicking "Low / out of stock" should show
   just those items.

Still open from the original plan:
6. **Profile / change-password page**: add a signed-in version of the reset
   form that calls `SupabaseAuthClient.updatePassword` (needs the access token kept
   in the session at login).
7. **Broader test pass** — more secured-controller (`@WebMvcTest`) tests and a
   couple of end-to-end flows.
8. **Move an item between locations** — item edit changes name + category only.
9. **Categories page** — the "Category picker" there doesn't do anything yet.
10. **Undo of "Keep"** — intentionally not undoable; revisit if wanted.

---

## 7. Good-to-know gotchas

- **This is Spring Boot 4, not 3.** Test annotations moved packages vs. most
  tutorials: `@WebMvcTest` is in `org.springframework.boot.webmvc.test.autoconfigure`,
  `@DataJpaTest` in `org.springframework.boot.data.jpa.test.autoconfigure`,
  `TestEntityManager` in `org.springframework.boot.jpa.test.autoconfigure`; use
  `@MockitoBean` (not the removed `@MockBean`). The web starter is
  `spring-boot-starter-webmvc`.
- **There is no users table.** Accounts live in Supabase Auth; our tables store
  the Supabase user id in `user_id` (UUID). `UserService.currentId()` returns it.
- **Thymeleaf precedence:** `th:replace` runs before both `th:each` *and*
  `th:if`. Put the loop or condition on an outer `<th:block>` and the
  `th:replace` on the inner element.
- **Port 8080 must be free.** If another copy of the app is already running,
  stop it before starting this one.
- **Free Supabase projects pause after about a week idle.** If the app can't
  connect, open the dashboard and click **Restore project**.
- **Database changes go in a new migration** (`V6__...sql`), never by editing
  V1–V5. See `DATABASE-CHANGES.md`.
- **Code style:** the code is kept **comment-free**; history and decisions live
  in `tasks/todo.md`, the README, and commit messages.
