# Pantry Tracker — task tracker

## Phase 0 — Dependency verification ✅
- [x] Verify toolchain (Java 25, Maven, Docker)
- [x] Generate Spring Boot 4.0.8 skeleton from Initializr
- [x] Externalize DB config via env placeholders
- [x] Build + boot against empty Postgres
- [x] Record resolved versions in README
- [x] Commit (74c0a78)

## Phase 1 — Auth + skeleton ✅
- [x] Add thymeleaf-layout-dialect dependency to pom.xml
- [x] Flyway V1: create app_user table
- [x] User entity + UserRepository
- [x] UserService.register (normalize, dup-check, BCrypt) + unit tests
- [x] RegisterForm DTO (validation + password match)
- [x] SecurityConfig + CustomUserDetailsService + PasswordEncoder
- [x] ThymeleafConfig (LayoutDialect bean)
- [x] Base layout.html (palette CSS vars, nav, Bootstrap+HTMX CDN)
- [x] login.html / register.html / dashboard.html
- [x] LoginController + RegistrationController + DashboardController
- [x] AuthSecurityTest (anon redirect, CSRF 403, CSRF happy path)
- [x] Verify: mvnw test green (7/7)
- [x] Verify: boot + Flyway V1 applied against Postgres
- [x] Verify: browser register/login/logout + anon redirect
- [x] Verify: app_user row has BCrypt hash
- [ ] Commit Phase 1

## Phase 2 — Categories + expiry reference ✅
- [x] Flyway V2: create category + category_expiry_reference, seed 15 rows
- [x] Category + CategoryExpiryReference entities + repositories
- [x] CategoryOption DTO + CategoryService.listOptions()
- [x] CategoryController (GET /categories reference page)
- [x] Searchable category dropdown fragment (client-side filter)
- [x] /categories page: dropdown + table of categories w/ shelf-life
- [x] CategorySeedTest (@DataJpaTest, real Postgres): 15 categories, each w/ ref
- [x] Verify: mvnw test green (9/9)
- [x] Verify: browser — dropdown filters, shows shelf-life per category
- [ ] Commit Phase 2

### Phase 2 notes
- Seeded the spec's "Stored (lower bound)" column verbatim. Note the spec's
  Rice row is internally inconsistent (range 1,460–1,825 but Stored = 730);
  followed the Stored column (730) as authoritative rather than inventing a
  number. Flag if you want Rice corrected to 1,460.
- Boot 4 test package moves: `@DataJpaTest` →
  `org.springframework.boot.data.jpa.test.autoconfigure`; `@AutoConfigureTestDatabase`
  → `org.springframework.boot.jdbc.test.autoconfigure`.
- Category dropdown is a reusable fragment (`fragments/category-select ::
  categorySelect(options, fieldName)` + `:: categorySelectScript`) so Phase 3's
  add-item form can drop it straight in.

## Phase 3 — Location groups + inventory ✅
- [x] Flyway V3: location_group, item, batch (full columns + indexes)
- [x] Entities LocationGroup/Item/Batch + repositories
- [x] DSA: DuplicateIndex (HashMap) + BatchSorter (insertion sort) + tests
- [x] CurrentUserService
- [x] LocationGroupService (create dup-reject, delete non-empty-reject) + test
- [x] ItemService (findDuplicate, create, update, delete)
- [x] BatchService (add, update, adjustQuantity clamp>=0 + empty_since, delete) + test
- [x] InventoryController (all inventory/group/item/batch routes, HTMX fragments)
- [x] inventory.html + fragments (groupBody, add-item, duplicate-prompt, item card, batch row, stepper)
- [x] Inventory nav link + htmx CSRF header wiring
- [x] InventorySecurityTest (anon redirect)
- [x] Verify: mvnw test green (20/20)
- [x] Verify: browser — group/item/batch/duplicate/stepper/delete flows
- [ ] Commit Phase 3

### Phase 3 notes
- HTML gotcha fixed: a <form> cannot wrap <td>s inside a <tr>; associated the
  cross-cell inputs to their form via the `form=` attribute instead.
- HTMX posts carry CSRF via a global htmx:configRequest header hook (meta tags
  in layout) so no per-form hidden token is needed.
- Whole test run needs a live Postgres (context + @DataJpaTest); Docker Desktop
  quitting mid-run caused a false failure once — restart + rerun was clean.

### Phase 3 deferrals (columns/logic intentionally left; tracked here, no code comments)
- Inventory view is eager server-rendered per group; per-group HTMX lazy-load /
  pagination not yet wired (GET /locations/{id}/items fragment endpoint exists).
- Item edit is rename + category only; moving an item between groups inline not
  built (delete + re-add for now).
- Phase 4: expiry auto-calc from category ref (auto_expiry), freshness status,
  low_stock_enabled/low_stock_threshold UI.
- Phase 5: purge sweep consuming empty_since + purge_override, grocery list,
  dashboard, undo stack.

## Phase 4 — Expiry engine + freshness + low stock ✅
- [x] CategoryExpiryReferenceRepository (shelf-life days by category)
- [x] FreshnessStatus + StockStatus enums (palette label + cssClass)
- [x] ExpiryCalculator + InventoryStatusCalculator + tests
- [x] Auto-calc wiring in ItemService.create / BatchService.add/update (autoExpiry)
- [x] updateItem gains lowStockEnabled + threshold
- [x] ItemView/BatchView carry statuses; toView takes calculator
- [x] Controller: autoExpiry + low-stock params + NoExpiryReference handling
- [x] Fragments: auto-calc checkbox, freshness badge, stock badge, low-stock toggle
- [x] Palette badge CSS + delegated auto-calc JS (works across HTMX swaps)
- [x] application.properties: pantry.expiring-soon-days=7
- [x] Verify: mvnw test green (26/26)
- [x] Verify: browser — auto-fill (Bread→today+3), expired/expiring/fresh colors, low/out-of-stock
- [ ] Commit Phase 4

### Phase 4 notes
- Freshness/stock statuses computed at query time in InventoryStatusCalculator;
  item roll-up = earliest-expiring in-stock batch (empty batches ignored).
- Auto-calc is per-batch via an "Auto expiry" checkbox (default on); the manual
  date input is disabled by a delegated JS hook using checkbox.form + form.elements
  (so it also drives batch-row inputs associated via the form= attribute).
- Rice-style spec inconsistency N/A here. All 15 categories have references, so
  the NoExpiryReference path is defensive only.

## Phase 5a — Grocery list + inventory loop + dashboard ✅
- [x] Flyway V4: grocery_list_item + item.low_stock_suggested
- [x] GroceryListItem entity + GrocerySource enum + repository; Item.lowStockSuggested
- [x] ExpiringSoonHeap (min-heap) + test
- [x] GroceryListService (sync anti-spam, addManual, list, togglePurchased, remove) + test
- [x] DashboardService + DashboardView (uses min-heap)
- [x] GroceryController + rewrite DashboardController (GET /)
- [x] grocery.html + fragments; dashboard.html rewrite; Add-to-list on inventory rows; nav links
- [x] GrocerySecurityTest (anon redirect)
- [x] Verify: mvnw test green (33/33)
- [x] Verify: browser — auto-suggest+anti-spam, manual add, check-off loop, dashboard min-heap
- [ ] Commit 5a, STOP for review

### Phase 5a note
- Thymeleaf gotcha: th:replace has higher precedence than th:each, so combining
  them on one element makes the loop var null. Wrap iteration in <th:block th:each>
  with th:replace on the inner element.

### Phase 5 decisions (user)
- Split: 5a (grocery+dashboard) then STOP; 5b (purge + undo) after continue.
- Undo scope: full snapshot-based, incl. field edits (5b).

## Phase 5b — Auto-purge sweep + undo stack ✅
- [x] PurgeService.sweep (7d item / 3d batch, overrides) + PurgeServiceIntegrationTest (real DB)
- [x] PurgeCalculator (days-until) ; ItemView/BatchView gain purgeOverride+daysUntilPurge
- [x] @EnableScheduling + PurgeSchedule daily job
- [x] Keep endpoints (item/batch set purge_override) + countdown UI + Keep buttons
- [x] UndoEntry sealed records + UndoService (session Stack) + UndoExecutor
- [x] Services record inverse on each mutation; /undo endpoint + OOB Undo control + toast
- [x] UndoServiceTest (LIFO) + UndoExecutorTest
- [x] Verify: mvnw test green (38/38)
- [x] Verify: browser — countdown flags, Keep→Kept, undo rename + undo batch delete, OOB undo
- [ ] Commit 5b; Phase 5 complete

### Phase 5b notes
- Undo covers item+batch add/edit/delete + quantity (snapshot-based, incl. edits).
  Recording is in the services (entities in hand); UndoExecutor reverses via
  repositories directly (no recursion). UndoService is @SessionScope.
- Keep (purge_override) is deliberately NOT undoable (safety action).
- OOB gotcha: the undo control must not live inside groupBody (it renders inline
  per group on full load → duplicate ids). Split into a groupBodyResponse wrapper
  that only HTMX mutations return; the page keeps a single #undo-slot.
- Boot 4 test package: TestEntityManager → org.springframework.boot.jpa.test.autoconfigure.

## Phase 6 — Packaging + polish (in progress)
- [x] Dockerfile (multi-stage: temurin 25-jdk build -> 25-jre runtime)
- [x] docker-compose.yml (app + postgres:16, healthcheck, named volume)
- [x] .dockerignore
- [x] README run instructions (Docker Compose + native)
- [x] Verified `docker compose up --build` boots the full stack (Flyway V1-V4, GET / -> 302)
- [ ] Empty states polish, change-password/profile page, broader test pass (remaining Phase 6)

## Review

### Phase 1 outcome
- 7/7 tests green: `UserServiceTest` (3, unit), `AuthSecurityTest` (3, WebMvc
  slice), `PantryTrackerApplicationTests` (1, context smoke against Postgres).
- End-to-end in browser: `/` → `/login` when anonymous; register →
  `/login?registered`; login → dashboard (nav + greeting show email); logout →
  `/login?logout`, and `/` redirects to login again. DB row stores a `$2a$10$`
  BCrypt hash. No console errors; palette renders.

### Phase 1 notes / Boot 4 gotchas hit
- `@WebMvcTest` moved to `org.springframework.boot.webmvc.test.autoconfigure`
  in Boot 4 (was `...test.autoconfigure.web.servlet`).
- `@MockBean` is gone in Boot 4 — used `@MockitoBean`
  (`org.springframework.test.context.bean.override.mockito`).
- Table named `app_user` (`user` is reserved in Postgres).
- `mvnw test` currently needs a live Postgres for the context smoke test;
  Testcontainers is the proper fix (deferred to the Phase 6 test pass).

---

## Supabase switch + grocery redesign (2026-10-20, branch `supabase-grocery`)

- [x] Database moved to Supabase only: `.env` read via `spring.config.import`,
      docker-compose is app-only, no localhost defaults.
- [x] `V5__supabase.sql`: `user_id` → `uuid` (Supabase Auth user id), dropped
      `app_user` and `grocery_list_item.purchased`, RLS on every app table.
      (`flyway_schema_history` RLS is a manual step; doing it inside a migration
      deadlocks on Flyway's own lock.)
- [x] Login via Supabase Auth (`SupabaseAuthClient`, server-side REST): login,
      register with email confirmation, forgot/reset password. Removed `User`,
      `UserRepository`, BCrypt, `UserDetailsService`, form login.
- [x] Grocery page: home-style layout, side cards (Shopping summary, Quick add,
      Recently stocked), merged list, inline − / +, checkboxes + **Put away (N)**.
- [x] Tests: 35 (32 pass anywhere, 3 DB tests skip without `.env`).
- [x] Verified V1–V5 + schema validation on a scratch Postgres, and the full
      login → grocery → put-away flow in a browser against a stand-in auth server.
- [x] Ran against the real Supabase project: V1–V5 applied (Flyway baselines at 0
      because new projects ship an `rls_auto_enable` function in `public`), RLS on
      all 7 tables, 35/35 tests pass with no skips.
- [ ] Check the confirmation and reset emails in the browser.

---

## Login lockout (2026-10-24, branch `andreu/login-lockout`)

Rule: 3 wrong passwords for the same email + IP lock that pair for 24 hours.

- [x] `V7__login_attempt.sql`: table keyed by (email, ip) with failed_count,
      last_failed_at, locked_until; RLS on.
- [x] `LoginAttemptService`: lockedUntil, recordFailure (atomic upsert; locks on
      the 3rd), clearPair on success, clearEmail on password reset, daily clean-up.
      Failures older than 24 h start the count over.
- [x] `SupabaseAuthClient`: errors carry a reason so only wrong passwords count;
      `updatePassword` returns the email.
- [x] `AuthController`: check lock before calling Supabase; "N attempts left";
      lock message with a reset link; reset clears the email's locks.
- [x] Tests: service (DB) + controller (lock blocks Supabase, 3rd failure locks,
      unconfirmed email doesn't count, reset clears).
- [x] Verify on a scratch database and in the browser, then on Supabase.

Review: 55 tests pass on a scratch Postgres (V1–V7). Browser check on a test copy
with a stand-in Supabase: 2 → 1 attempts left, locked on the 3rd, correct password
refused while locked (Supabase not called), reset link cleared the lock, login
worked. V7 also reached the real Supabase early, via DevTools restarting the
running app (see lessons.md); it only adds the empty `login_attempt` table.
