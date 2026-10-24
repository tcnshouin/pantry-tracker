# Lessons

- **DevTools restarts the running app on every rebuild.** If `./mvnw spring-boot:run`
  is running against Supabase, compiling or running tests in the same folder
  restarts it with the new code, and Flyway applies any new migration to the real
  database. Stop the real app before building a change that adds a migration,
  or work in a separate copy of the folder.
