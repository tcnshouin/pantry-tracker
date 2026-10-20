# Supabase Setup (do this once)

Pantry Tracker keeps all of its data in a **Supabase** Postgres database and
signs people in with **Supabase Auth** (email + password). There is no local
database. This guide takes about 10 minutes.

You will end up with a `.env` file in the project folder holding five values.
`.env` is git-ignored, so **never commit it or paste it in chat**. Share it with
teammates privately (e.g. a direct message), or have each teammate make their own
project.

---

## 1. Create the project

1. Go to <https://supabase.com> and sign in (GitHub login works).
2. Click **New project**.
3. Fill in:
   - **Name:** `pantry-tracker`
   - **Database password:** click **Generate a password**, then **copy it
     somewhere safe now**. You need it in step 3 and Supabase won't show it
     again (you can reset it later under Project Settings → Database).
   - **Region:** Southeast Asia (Singapore), the closest one.
4. Click **Create new project** and wait about a minute for it to finish.

## 2. Copy the API values (for login)

Open **Project Settings → API Keys** (older dashboards: **Project Settings → API**).

| Copy this | Into `.env` as |
| --------- | -------------- |
| **Project URL**: `https://<something>.supabase.co` (on the **Data API** page, or the project's home page) | `SUPABASE_URL` |
| **Publishable key** (`sb_publishable_…`), or the legacy **anon public** key | `SUPABASE_ANON_KEY` |

Do **not** use the `service_role` / secret key. The app doesn't need it.

## 3. Copy the database connection (for data)

1. Click **Connect** at the top of the dashboard.
2. Choose the **Session pooler** connection. Don't use "Direct connection",
   because it only works over IPv6 and most home networks can't reach it.
3. It shows a URI like
   `postgresql://postgres.abcdefghijkl:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`.
   Split it into three values:

| Part of the URI | Into `.env` as |
| --------------- | -------------- |
| `jdbc:postgresql://` + host + `:5432/postgres?sslmode=require`, e.g. `jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require` | `DB_URL` |
| the user before the `:`, e.g. `postgres.abcdefghijkl` | `DB_USERNAME` |
| the database password from step 1 | `DB_PASSWORD` |

## 4. Tell Supabase where the app runs

Open **Authentication → URL Configuration**:

- **Site URL:** `http://localhost:8080`
- **Redirect URLs** → **Add URL:** `http://localhost:8080/reset-password`

This makes the confirmation and password-reset emails link back to the app.

> Optional: **Authentication → Sign In / Providers → Email** has a
> **Confirm email** switch. Leave it on for real use. Turning it off lets you
> log in right after signing up, which is handy when testing.

## 5. Create your `.env`

In the project folder:

```bash
cp .env.example .env
```

Open `.env` in your editor and replace each placeholder with the values from
steps 2–3. It should look like this (with your values):

```
SUPABASE_URL=https://abcdefghijkl.supabase.co
SUPABASE_ANON_KEY=sb_publishable_...
DB_URL=jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require
DB_USERNAME=postgres.abcdefghijkl
DB_PASSWORD=...
```

## 6. Run it

```bash
./mvnw spring-boot:run
```

On the first start, Flyway creates every table in Supabase (look for
`Successfully applied 5 migrations`). Open <http://localhost:8080>, click
**Create one**, confirm the email Supabase sends you, and log in.

Docker works too: `docker compose up --build` reads the same `.env`.

## 7. One last security switch (after the first run)

Supabase exposes every table in the `public` schema through its web API. Our
migration already locks the app tables with Row Level Security. Flyway's own
history table gets created during the first run, so lock that one by hand:
open **SQL Editor**, paste this, and click **Run**:

```sql
alter table flyway_schema_history enable row level security;
```

Afterwards, **Advisors → Security Advisor** should show no "RLS disabled"
warnings.

---

## Good to know

- **Users** are listed under **Authentication → Users**. There is no users table
  of our own; each row in our tables stores the Supabase user id (`user_id`, a UUID).
- **Your data** is under **Table Editor**, and you can run SQL in **SQL Editor**.
- **`'url' must start with "jdbc"`** on startup means `.env` is missing or not in the
  project folder you run from.
- **Free projects pause after about a week without use.** If the app suddenly can't
  connect, open the dashboard and click **Restore project**.
- **Email limits:** Supabase's built-in email sender only allows a few emails per
  hour. That's fine for a class project. If sign-up says "Too many emails sent",
  wait a bit or turn off **Confirm email** while testing.
- **Tests:** `./mvnw test` runs the unit and page tests anywhere. The two database
  tests run only when `.env` exists and roll back their changes, so they leave
  no rows behind.
- **Sharing one project as a team:** everyone uses the same `.env`, so you all see
  the same tables (each account only sees its own pantry). A schema change
  (new `V6__…sql`) is applied to the shared database by whoever runs the new code
  first, so pull before running. See `DATABASE-CHANGES.md`.
