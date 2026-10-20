# How to Change the Database (team guide)

This project uses **Flyway migrations** to manage the database. That means every
change to the database (new table, new column, etc.) is written as a numbered SQL
file that lives in the repo, so the whole team stays in sync through Git.

> **Important:** the database is a **Supabase** project (see `SUPABASE-SETUP.md`).
> If the team shares one project (same `.env`), everyone uses the **same**
> database, and a migration is applied once, by whoever first runs code that
> contains it. If each person made their own project, each database is updated
> separately. Either way, Git shares the *structure* (migration files), not the data.

---

## Where migrations live

```
pantry-tracker/src/main/resources/db/migration/
    V1__create_user.sql
    V2__create_category_and_expiry_reference.sql
    V3__create_inventory.sql
    V4__grocery_list.sql
    V5__supabase.sql
    ...            <-- your new file goes here as V6, V7, ...
```

File name format: **`V<number>__<short_description>.sql`** — capital `V`, a number,
then **two** underscores, then a snake_case description. Example:
`V6__add_item_notes.sql`.

---

## Making a change (the 5 steps)

**1. Pull first** so you're up to date and pick the correct next number.
```bash
git pull
```

**2. Create the next migration file** (one higher than the last one) and write your
SQL in it. Example — add a `notes` column to the `item` table:
```sql
-- V6__add_item_notes.sql
alter table item add column notes varchar(500);
```

**3. Update the Java code if needed.** The app starts with `ddl-auto=validate`, so
the database and the entity classes must match. For the example above, add a field
in `src/main/java/com/pantry/tracker/model/Item.java`:
```java
@Column(name = "notes")
private String notes;
```

**4. Run the app to apply it.** Flyway applies the new migration automatically on
startup — no manual SQL needed.
```bash
./mvnw spring-boot:run             # or:  docker compose up --build
```
Look for a log line like `Migrating schema "public" to version "6 - add item notes"`.
That confirms it worked.

**5. Commit and push** the migration file (plus any code changes).
```bash
git add -A
git commit -m "Add notes column to item (V6)"
git push
```

---

## How teammates get your change

They only do two things:
```bash
git pull
./mvnw spring-boot:run             # or restart their running app
```
On their next start, Flyway applies the new `V6` if their database doesn't have
it yet. On a shared Supabase project it is usually already applied, and Flyway
just skips it. Existing data is kept.

> **Shared project tip:** once someone applies `V6` to the shared database,
> teammates on older code usually still start fine. If one of them gets a
> "Schema-validation" error on startup, the fix is `git pull` and restart.

### Does it update automatically when someone pushes?

**No — pushing only uploads the files.** A database updates only when that person
**pulls** the new migration **and restarts the app** (then Flyway applies it on
boot). Nothing changes a database until someone runs the app.

| Action | Updates the database? |
| ------ | --------------------- |
| `git push` (share the file) | No, it just uploads code |
| `git pull` (download the file) | No, it just downloads code |
| **Start / restart the app** | **Yes — Flyway applies pending migrations** |

The full loop:
```
you:       edit V#  →  run  →  commit  →  push
teammate:  git pull  →  restart app      <-- Flyway auto-applies it here
```

---

## Rules that keep this from breaking

- **Never edit a migration that already ran** (V1–V5, or any file a teammate has
  already applied). Flyway stores a checksum of each file; changing one makes the
  app refuse to start. To change something, always add a **new, higher-numbered**
  file instead.
- **Only go up in version number.** `V5`, then `V6`, and so on. Never reuse a number.
- **Coordinate the number with your team.** If two people both create `V5`, they
  clash — whoever pushes second renames theirs to `V6`. Pulling first (step 1)
  avoids most of this.
- **Keep SQL and entities in sync.** Add the column in the migration *and* map it in
  the entity class, or the app fails validation on startup.
- **Each person needs push access** to the GitHub repo (be added as a collaborator)
  so they can share changes back.

---

## Resetting a broken database

This **erases all pantry data in that Supabase project** (accounts stay), so on
a shared project agree with the team first. In the Supabase **SQL Editor**, run:
```sql
drop schema public cascade;
create schema public;
grant usage on schema public to postgres, anon, authenticated, service_role;
```
Then start the app: Flyway rebuilds everything from V1 to the latest. Afterwards, run
the `flyway_schema_history` RLS line from `SUPABASE-SETUP.md` step 7 again.

---

## Copy-paste template for a new migration

Create `src/main/resources/db/migration/V6__your_change.sql` (bump the number):
```sql
-- V6__your_change.sql
-- Describe what this change does.

-- examples:
-- add a column:
--   alter table item add column notes varchar(500);
-- create a table:
--   create table example (
--       id bigint generated by default as identity primary key,
--       name varchar(200) not null
--   );
-- add an index:
--   create index ix_item_notes on item (notes);
-- new tables in Supabase should also get:
--   alter table example enable row level security;
```
