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
