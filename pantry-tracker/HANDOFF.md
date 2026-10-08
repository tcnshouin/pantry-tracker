# Pantry Tracker — Developer Handoff

A short guide for the next developer: what you need installed, how to pull and
run the project, where things live, and what's still left to build.

- **Repository:** `https://github.com/Rarityl/DLSL---Computer-Engineering---1st-Year`
- **Branch:** `claude/pantry-tracker-phase-0-7832d2`
- **Project folder in the repo:** `pantry-tracker/`
- **Stack:** Java 25 · Spring Boot 4.0.8 · Thymeleaf + HTMX + Bootstrap 5 ·
  Spring Data JPA · PostgreSQL 16 · Flyway · Maven

---

## 1. What you need installed (prerequisites)

You have two ways to run it. Pick one.

### The easy way — Docker only (recommended)
- **Git** — to clone the repo.
- **Docker Desktop** (includes Docker Compose) — the app builds and runs inside
  containers, so you do **not** need Java, Maven, or PostgreSQL installed.

That's the whole list. Everything else (JDK 25, the database) is handled by the
containers.

### The dev way — run natively (faster edit/reload while coding)
- **Git**
- **JDK 25** (Temurin/OpenJDK 25). Check with `java -version`.
- **PostgreSQL 16** running locally, OR Docker to start just the database.
- Maven is **not** required — the project ships the Maven wrapper (`./mvnw`).

You also need **access to the GitHub repository** (ask the owner to add you as a
collaborator if `git clone` asks for credentials and fails).

---

## 2. Get the code

```bash
git clone https://github.com/Rarityl/DLSL---Computer-Engineering---1st-Year.git
cd "DLSL---Computer-Engineering---1st-Year"
git checkout claude/pantry-tracker-phase-0-7832d2
cd pantry-tracker
```

---

## 3. Run it

### Option A — Docker Compose (one command)
```bash
docker compose up --build
```
Then open <http://localhost:8080>, click **Create one** to register an account,
and log in. The first build downloads dependencies and takes a few minutes;
later builds are cached. Stop with `Ctrl+C`, then `docker compose down`
(add `-v` to also erase the database).

### Option B — Native
```bash
# start a throwaway database
docker run -d --name pantry-pg \
  -e POSTGRES_DB=pantry -e POSTGRES_USER=pantry -e POSTGRES_PASSWORD=devpw \
  -p 5432:5432 postgres:16

# run the app
DB_PASSWORD=devpw ./mvnw spring-boot:run
```

### Run the tests (needs a reachable Postgres, as in Option B)
```bash
DB_PASSWORD=devpw ./mvnw test
```
Current suite: **38 tests, all passing.**

> Config is externalized: `DB_URL` and `DB_USERNAME` default to the local
> `pantry`/`pantry` database; `DB_PASSWORD` has **no default** and must be set
> (Compose sets it for you). No secrets are hardcoded.

---

## 4. Where things are (project map)

```
pantry-tracker/
├── Dockerfile, docker-compose.yml       # containerized run (Phase 6)
├── README.md                            # full build spec + phase log
├── src/main/java/com/pantry/tracker/
│   ├── config/      # AppConfig: security, password encoder, layout dialect
│   ├── model/       # entities (User, Category, Item, Batch, LocationGroup,
│   │                #   GroceryListItem) + Views.java (status enums + view records)
│   ├── repository/  # Spring Data repositories
│   ├── service/     # UserService, InventoryService, GroceryService,
│   │                #   DataStructures.java (the 4 required data structures)
│   └── web/         # AuthController, HomeController, GroceryController,
│                    #   CategoryController
├── src/main/resources/
│   ├── db/migration/   # Flyway V1–V4 (schema + seed data)
│   └── templates/      # Thymeleaf pages + HTMX fragments
└── tasks/todo.md        # per-phase checklists, decisions, and deferrals
```

Progress is tracked phase-by-phase in `tasks/todo.md` — read that for the
detailed history and the small decisions made along the way.

---

## 5. Where development stopped (status)

**Done and working (Phases 0–5, all committed):**
- Auth (register / login / logout, BCrypt, CSRF).
- Categories with seeded shelf-life reference (searchable dropdown).
- Location groups + two-level inventory (Item = product, Batch = dated instance),
  grouped collapsible view, duplicate detection, quantity steppers.
- Expiry auto-calculation, freshness status (fresh / expiring-soon / expired),
  low-stock + out-of-stock flags, color-coded.
- Grocery list: auto-suggests low/out-of-stock items (with anti-spam), manual add,
  and the inventory loop (check off → add back into inventory).
- Home page: one window with an overview strip (totals, expiring-this-week,
  low-stock, on-grocery-list, expiring-soon) above the inventory.
- Auto-purge scheduled sweep (7-day item / 3-day batch) with Keep overrides and
  countdown flags.
- Per-session undo stack (add/edit/delete, including field edits).
- UI: left sidebar nav, full-width top header, per-group "Add item" modal.
- Docker Compose packaging.

**Required data structures (for the report) — implemented and pointed-to:**
All four live in `service/DataStructures.java`:
- **HashMap** — duplicate detection (`DuplicateIndex`).
- **Insertion sort** — batch ordering by expiry (`insertSorted`).
- **Min-heap / PriorityQueue** — "expiring soon" list (`ExpiringSoonHeap`).
- **Stack (LIFO)** — undo (`UndoStack`, kept in the user's session).
- **B-tree indexes** — the composite/functional DB indexes in the Flyway migrations.

---

## 6. What's still missing (your TODO)

Nothing is broken — these are the remaining **Phase 6 polish** items and a few
intentionally-deferred niceties:

1. **Empty states** — friendlier placeholders when the home page is empty
   (partly present; could be nicer).
2. **Profile / change-password page** — not built yet. Add a settings page that
   lets a logged-in user change their password (reuse `UserService` + BCrypt).
3. **Broader test pass** — service logic is well covered; consider adding more
   secured-controller (`@WebMvcTest`) tests and a couple of end-to-end flows.
4. **Inventory pagination per group** — currently each group renders all its
   items at once; paginate or lazy-load for large lists.
5. **Move an item between groups inline** — item edit currently changes name +
   category only; there's no in-place "move to another group" (delete + re-add
   works as a workaround).
6. **Undo of "Keep"** — the purge-override "Keep" action is intentionally not
   undoable (a safety action); revisit if you want it reversible.

Nice-to-have ideas beyond the spec: item search/filter across groups, CSV export,
and a mobile polish pass.

---

## 7. Good-to-know gotchas (this is Spring Boot **4**, not 3)

- Test annotations moved packages vs. most online tutorials: `@WebMvcTest` is in
  `org.springframework.boot.webmvc.test.autoconfigure`, `@DataJpaTest` in
  `org.springframework.boot.data.jpa.test.autoconfigure`, `TestEntityManager` in
  `org.springframework.boot.jpa.test.autoconfigure`; use `@MockitoBean` (not the
  removed `@MockBean`). The web starter is `spring-boot-starter-webmvc`.
- The DB table for users is `app_user` (`user` is reserved in PostgreSQL).
- HTMX + Thymeleaf: when looping fragments, `th:replace` outranks `th:each`, so
  iterate with `<th:block th:each>` and put `th:replace` on the inner element.
- The team style so far keeps generated code **comment-free**; history and
  decisions live in `tasks/todo.md` and the README instead.
