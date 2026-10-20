# Pantry Tracker — Team Handoff

Everything a groupmate needs to get the project, run it, change it, and push
their work without breaking anyone else's.

- **Repository:** <https://github.com/tcnshouin/pantry-tracker> (owner: **tcnshouin**)
- **Branch to work from:** `main`
- **Stack:** Java 25 · Spring Boot 4.0.8 · Thymeleaf + HTMX + Bootstrap 5 ·
  Spring Data JPA · Supabase (hosted Postgres + Supabase Auth) · Flyway · Maven
- **Status (Oct 20, 2026):** Supabase login + database, redesigned Grocery
  page, and per-user editable Categories are merged into `main` (PR #1).
  42 tests, all passing.

---

## 1. Get access (one time)

You need **two** things. Neither one gives you the other.

| Access | Who gives it | How |
| ------ | ------------ | --- |
| **Push code to GitHub** | tcnshouin | Repo → **Settings → Collaborators** → **Add people** → your GitHub username, role **Write**. You then accept the invite from the email or at <https://github.com/tcnshouin/pantry-tracker/invitations>. |
| **Run the app (`.env` file)** | Whoever owns the Supabase project | They send you the `.env` file **privately** (direct message, not the group chat, never in Git). |

Optional: to open the Supabase dashboard (tables, users, SQL), the project owner
invites you under **supabase.com → Organization → Team**.

> **"Permission … denied to <name>" when pushing** means GitHub doesn't see you
> as a Write collaborator yet: the invite went to a different account, wasn't
> accepted, or was given the Read role. Check `ssh -T git@github.com` to see
> which account your computer signs in as.

---

## 2. Install

- **Git**
- **JDK 25** (Temurin/OpenJDK 25). Check with `java -version`. Maven isn't
  needed; the project ships the wrapper (`mvnw`).
- *Or* **Docker Desktop** instead of Java (see section 3). Docker only runs the
  app; the database is always Supabase.

---

## 3. Get the code and run it

```bash
git clone git@github.com:tcnshouin/pantry-tracker.git
cd pantry-tracker
```

Put the `.env` file you were sent into this `pantry-tracker` folder (next to
`pom.xml`). Then:

```bash
./mvnw spring-boot:run
```

Windows: `.\mvnw.cmd spring-boot:run`. Docker: `docker compose up --build`
(reads the same `.env`; rebuild after code changes).

Open <http://localhost:8080>, click **Create one**, confirm the email Supabase
sends you, and log in. Everyone signs up with their **own** email.

**Each account has its own private pantry.** Sharing one Supabase project means
sharing the same tables, but you won't see each other's items, locations,
grocery lists or categories.

### Tests
```bash
./mvnw test
```
42 tests. Unit and page tests run anywhere. The database tests
(`RepositoryTest`, `PantryTrackerApplicationTests`) run against Supabase only
when `.env` exists, and roll back everything they write.

### Common startup errors
| Error | Fix |
| ----- | --- |
| `'url' must start with "jdbc"` | `.env` is missing or not in the folder you run from. |
| `Port 8080 is already in use` | Another copy of the app is running. Stop it first. |
| Can't connect to the database | Free Supabase projects pause after ~1 week idle. Owner opens the dashboard → **Restore project**. |
| "Too many emails sent" on sign-up | Supabase's free email limit. Wait a bit, or the owner turns off **Confirm email** while testing. |

Setting up a brand-new Supabase project instead: follow
**[SUPABASE-SETUP.md](SUPABASE-SETUP.md)**.

---

## 4. Working together (daily routine)

```bash
git checkout main
git pull                      # always before you start
git checkout -b your-name/short-topic
# ...make changes, run the app, run ./mvnw test...
git add -A
git commit -m "Short description of what changed"
git push -u origin your-name/short-topic
```

Then open a **Pull Request** on GitHub into `main` and let someone glance at it
before merging. Small branches merged often cause far fewer conflicts than one
big one at the end.

Rules that keep everyone safe:
- **Never commit `.env`.** It's already in `.gitignore`; don't force-add it, and
  don't paste its values into code, chat or issues.
- **Pull before you start, and before you push.**
- **Run `./mvnw test` before pushing.**
- **Don't edit old migration files.** Database changes go in a new file (section 6).
- If two people need to change `layout.html` (it holds all the CSS and JS),
  say so in the group chat first; it's the file most likely to conflict.

---

## 5. Where things are

```
pantry-tracker/
├── .env.example                 # names of the 5 settings (.env itself is never in Git)
├── SUPABASE-SETUP.md            # one-time Supabase project setup
├── DATABASE-CHANGES.md          # how to change the database (Flyway)
├── README.md                    # build spec + phase log
├── Dockerfile, docker-compose.yml
├── src/main/java/com/pantry/tracker/
│   ├── config/AppConfig.java    # security rules (who can open which page)
│   ├── model/                   # entities: Category, Item, Batch, LocationGroup,
│   │                            #   GroceryListItem; SupabaseUser; Views.java (view records,
│   │                            #   status wording, shelf-life text)
│   ├── repository/              # database queries (Spring Data)
│   ├── service/
│   │   ├── InventoryService     # items, batches, expiry, purge, undo
│   │   ├── GroceryService       # grocery list, Quick Add, Add to Pantry
│   │   ├── CategoryService      # per-user categories + starter list
│   │   ├── SupabaseAuthClient   # login / sign-up / reset through Supabase
│   │   ├── UserService          # current user's id
│   │   └── DataStructures.java  # the 4 required data structures (report!)
│   └── web/                     # HomeController, GroceryController,
│                                #   CategoryController, AuthController
├── src/main/resources/
│   ├── application.properties   # reads values from .env
│   ├── db/migration/            # Flyway V1–V6
│   ├── static/img/              # logo, favicon, empty-state pictures
│   └── templates/
│       ├── layout.html          # title bar, ☰ menu, ALL CSS + page JS
│       ├── home.html            # Inventory page (My Pantry, Expiring Soon, items)
│       ├── grocery/             # Grocery page
│       ├── categories.html      # Categories page
│       ├── inventory/fragments.html  # item rows, steppers, menus, modals
│       └── auth/                # login, register, forgot/reset password
└── tasks/todo.md                # checklists, decisions, what was deferred
```

**Rule of thumb:** change how something *looks* in `templates/` (colours are
CSS variables at the top of `layout.html`); change how it *behaves* in
`service/` (rules) or `web/` (what each URL/button does).

---

## 6. Changing the database

Read **[DATABASE-CHANGES.md](DATABASE-CHANGES.md)**. Short version:
1. `git pull`, then add the **next** file: `V7__what_you_changed.sql`.
2. Update the matching Java entity (the app refuses to start if they disagree).
3. Run the app. Flyway applies it.
4. Commit and push the migration together with the Java change.

If the team shares one Supabase project, the migration runs on the **shared**
database the first time anyone starts code containing it. So pull before
running, and tell the group when you push a migration.

---

## 7. What's done

- **Accounts:** Supabase Auth sign-up (email confirmation), login, logout,
  forgot/reset password. No users table of our own; every row stores the
  Supabase user id (`user_id`, UUID). Tables locked with Row Level Security.
- **Inventory (Home):** My Pantry location list (search, add, **All** view
  in date-added order), one location at a time, items with batches, − / +
  stepper, expiry auto-calculation, fresh / expiring soon / expires today /
  expired, low and out of stock, Expiring Soon panel (click to jump), undo
  pop-up, auto-purge with Keep.
- **Grocery:** auto-suggested low/out-of-stock items plus manual adds, inline
  − / +, Select all, **Add to Pantry (N)**. Side cards: Shopping Summary,
  Quick Add, Recently Stocked.
- **Categories:** each user has their own list (~90 starter categories for
  Philippine pantry items, in groups), search, Category Picker filter, New
  Category, edit, delete (blocked while items use it). Shelf life shown in
  days/months/years. **Others** has no shelf life, so the expiry date must be
  typed by hand.
- **Layout:** responsive side cards that show only whole rows and adapt to
  short screens (e.g. Quick Add shows 3 rows on a monitor, 2 on a laptop).

**Required data structures (for the report)**, all in `service/DataStructures.java`:
- **HashMap** — duplicate detection (`DuplicateIndex`)
- **Insertion sort** — batch ordering by expiry (`insertSorted`)
- **Min-heap / PriorityQueue** — Expiring Soon list (`ExpiringSoonHeap`)
- **Stack (LIFO)** — undo (`UndoStack`, kept in the session)
- Plus **B-tree indexes** in the Flyway migrations

---

## 8. What's left (pick one, tell the group)

1. **Test the real emails** — the Supabase confirmation and password-reset
   emails haven't been clicked through end to end on the live project yet.
2. **Make the counts agree** — "Expiring this week" ignores expired batches but
   the Expiring Soon panel lists them. Rename to "Needs attention" or split them.
3. **Duplicate names in Expiring Soon** — one item with two batches appears
   twice. Merge per item or show "×3".
4. **Screen-reader labels** — put the item name in the −, +, 🛒 and ⋯ button
   labels (e.g. `aria-label="Remove one Bread Pan"`).
5. **Flag locations that need attention** — a dot/count in the My Pantry list.
6. **Stat boxes as filters** — click "Low / out of stock" to show only those.
7. **Profile / change-password page** — signed-in version of the reset form
   using `SupabaseAuthClient.updatePassword`.
8. **Move an item to another location** — item edit only changes name + category.
9. **More tests** — secured-controller (`@WebMvcTest`) tests, a couple of
   end-to-end flows.
10. Small: after deleting a location the message says "Group deleted";
    "Location deleted" would match the UI.

Housekeeping: the remote branches `supabase-grocery` (merged) and
`claude/pantry-tracker-phase-0-7832d2` (old) can be deleted on GitHub.

---

## 9. Gotchas

- **Spring Boot 4, not 3.** Test annotations moved: `@WebMvcTest` is in
  `org.springframework.boot.webmvc.test.autoconfigure`, `@DataJpaTest` in
  `org.springframework.boot.data.jpa.test.autoconfigure`; use `@MockitoBean`
  (not `@MockBean`).
- **Thymeleaf:** `th:replace` runs before `th:each` and `th:if`. Put the loop or
  condition on an outer `<th:block>`.
- **Code style:** no comments in the code. History and decisions live in
  `tasks/todo.md`, the README and commit messages.
