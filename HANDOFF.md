# Pantry Tracker — Developer Handoff

A short guide for the next developer: what you need installed, how to get and
run the project, where things live, and what's still left to build.

- **Repository:** `https://github.com/tcnshouin/pantry-tracker`
- **Branch:** `main`
- **Project root:** the repository root (no subfolder)
- **Stack:** Java 25 · Spring Boot 4.0.8 · Thymeleaf + HTMX + Bootstrap 5 ·
  Spring Data JPA · PostgreSQL 16 · Flyway · Maven

> This repository was split out of the original group repo
> (`Rarityl/DLSL---Computer-Engineering---1st-Year`, branch
> `claude/pantry-tracker-phase-0-7832d2`, folder `pantry-tracker/`). The full
> commit history came with it; the other projects in that repo did not.

---

## 1. What you need installed

You have two ways to run it. Pick one.

### The easy way — Docker only (recommended)
- **Git** — to clone the repo.
- **Docker Desktop** (includes Docker Compose) — the app and database run inside
  containers, so you do **not** need Java, Maven, or PostgreSQL installed.

### The dev way — run natively (faster edit/reload while coding)
- **Git**
- **JDK 25** (Temurin/OpenJDK 25). Check with `java -version`.
- **PostgreSQL 16** running locally, OR Docker to start just the database.
- Maven is **not** required — the project ships the Maven wrapper (`mvnw`).

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

### Option A — Docker Compose (one command)
```bash
docker compose up --build
```
Open <http://localhost:8080>, click **Create one** to register, and log in. The
first build downloads dependencies and takes a few minutes; later builds are
cached.

- Run it in the background instead: `docker compose up --build -d`
- Stop it: `Ctrl+C`, then `docker compose down` (add `-v` to also **erase** the
  database).
- **After changing code or templates, rebuild** (`docker compose up --build`) —
  the running container does not pick up edits on its own.

### Option B — Native
```bash
# start a throwaway database
docker run -d --name pantry-pg -e POSTGRES_DB=pantry -e POSTGRES_USER=pantry -e POSTGRES_PASSWORD=devpw -p 5432:5432 postgres:16

# run the app (macOS/Linux)
DB_PASSWORD=devpw ./mvnw spring-boot:run
```
On Windows PowerShell, set the variable first:
```powershell
$env:DB_PASSWORD = 'devpw'; .\mvnw.cmd spring-boot:run
```

### Run the tests
```bash
DB_PASSWORD=devpw ./mvnw test
```
The suite has **26 tests**. The repository and full-app tests need a reachable
Postgres (as in Option B); the service and data-structure tests run without one:
```bash
./mvnw test -Dtest=InventoryServiceTest,DataStructuresTest,GroceryServiceTest,UserServiceTest
```

> Config is externalized: `DB_URL` and `DB_USERNAME` default to the local
> `pantry`/`pantry` database; `DB_PASSWORD` has **no default** and must be set
> (Compose sets it for you). No secrets are hardcoded.

### Looking at the database
With the Compose setup running:
```bash
docker compose exec db psql -U pantry -d pantry
```
Then `\dt` lists tables and `\q` quits. The data itself lives in a Docker volume
on your machine — it is **not** in Git. A fresh clone starts with an empty
database that Flyway sets up on first start.

---

## 4. Where things are (project map)

```
pantry-tracker/                      (repo root)
├── Dockerfile, docker-compose.yml   # containerized run
├── README.md                        # full build spec + phase log
├── DATABASE-CHANGES.md              # how to change the schema (Flyway V5, V6, …)
├── src/main/java/com/pantry/tracker/
│   ├── config/      # AppConfig: security, password encoder, layout dialect
│   ├── model/       # entities (User, Category, Item, Batch, LocationGroup,
│   │                #   GroceryListItem) + Views.java (status enums, view
│   │                #   records, "Expiring in N days" wording)
│   ├── repository/  # Spring Data repositories
│   ├── service/     # InventoryService (most rules), GroceryService, UserService,
│   │                #   DataStructures.java (the 4 required data structures)
│   └── web/         # HomeController, GroceryController, CategoryController,
│                    #   AuthController
├── src/main/resources/
│   ├── application.properties   # DB connection settings
│   ├── db/migration/            # Flyway V1–V4 (schema + seed categories)
│   └── templates/               # Thymeleaf pages + HTMX fragments
│       ├── layout.html          #   title bar, ☰ menu, ALL colors/CSS, page JS
│       ├── home.html            #   home page + left panel
│       └── inventory/fragments.html  # item rows, steppers, menus, undo toast
└── tasks/todo.md                # per-phase checklists, decisions, deferrals
```

**Rule of thumb:** to change how something *looks*, edit `templates/` (colors
are CSS variables at the top of `layout.html`). To change how something
*behaves*, edit `service/` (rules) or `web/` (what each URL/button does).

---

## 5. Where development stopped (status)

**Core features (done):**
- Auth (register / login / logout, BCrypt, CSRF).
- Categories with seeded shelf-life reference (searchable dropdown).
- Locations + two-level inventory (Item = product, Batch = dated purchase),
  duplicate detection.
- Expiry auto-calculation and freshness status: fresh / expiring soon /
  **expires today** / expired; low-stock and out-of-stock flags.
- Grocery list: auto-suggests low/out-of-stock items, manual add, and the
  inventory loop (check off → add back into inventory).
- Auto-purge sweep (7-day item / 3-day batch) with Keep overrides.
- Per-session undo stack.
- Docker Compose packaging.

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
6. **Profile / change-password page** — reuse `UserService` + BCrypt.
7. **Broader test pass** — more secured-controller (`@WebMvcTest`) tests and a
   couple of end-to-end flows.
8. **Move an item between locations** — item edit changes name + category only.
9. **Grocery page** — merge "Suggested" and "Added by you" into one list.
10. **Categories page** — the "Category picker" there doesn't do anything yet.
11. **Undo of "Keep"** — intentionally not undoable; revisit if wanted.

---

## 7. Good-to-know gotchas

- **This is Spring Boot 4, not 3.** Test annotations moved packages vs. most
  tutorials: `@WebMvcTest` is in `org.springframework.boot.webmvc.test.autoconfigure`,
  `@DataJpaTest` in `org.springframework.boot.data.jpa.test.autoconfigure`,
  `TestEntityManager` in `org.springframework.boot.jpa.test.autoconfigure`; use
  `@MockitoBean` (not the removed `@MockBean`). The web starter is
  `spring-boot-starter-webmvc`.
- **The users table is `app_user`** (`user` is reserved in PostgreSQL).
- **Thymeleaf precedence:** `th:replace` runs before both `th:each` *and*
  `th:if`. Put the loop or condition on an outer `<th:block>` and the
  `th:replace` on the inner element.
- **Port 8080 must be free.** If another copy of the app is already running,
  stop it (`docker compose down` in that folder) before starting this one.
- **The Docker database volume is named after the folder** you run Compose
  from, so cloning into a different folder name gives you a separate, empty
  database.
- **Database changes go in a new migration** (`V5__...sql`), never by editing
  V1–V4 — see `DATABASE-CHANGES.md`.
- **Code style:** the code is kept **comment-free**; history and decisions live
  in `tasks/todo.md`, the README, and commit messages.
