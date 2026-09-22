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
