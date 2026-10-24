package com.pantry.tracker.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.response.SecurityMockMvcResultMatchers.authenticated;
import static org.springframework.security.test.web.servlet.response.SecurityMockMvcResultMatchers.unauthenticated;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pantry.tracker.config.AppConfig;
import com.pantry.tracker.model.SupabaseUser;
import com.pantry.tracker.service.CategoryService;
import com.pantry.tracker.service.GroceryService;
import com.pantry.tracker.service.InventoryService;
import com.pantry.tracker.service.LoginAttemptService;
import com.pantry.tracker.service.LoginAttemptService.Failure;
import com.pantry.tracker.service.SupabaseAuthClient;
import com.pantry.tracker.service.SupabaseAuthClient.AuthException;
import com.pantry.tracker.service.UserService;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = {AuthController.class, HomeController.class, GroceryController.class})
@Import(AppConfig.class)
class SecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SupabaseAuthClient supabase;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private InventoryService inventoryService;

    @MockitoBean
    private GroceryService groceryService;

    @MockitoBean
    private CategoryService categoryService;

    @MockitoBean
    private LoginAttemptService loginAttempts;

    @Test
    void pagesRedirectToLoginWhenNotSignedIn() throws Exception {
        mockMvc.perform(get("/")).andExpect(status().is3xxRedirection()).andExpect(redirectedUrl("/login"));
        mockMvc.perform(get("/grocery")).andExpect(status().is3xxRedirection()).andExpect(redirectedUrl("/login"));
    }

    @Test
    void authPagesAreOpenToEveryone() throws Exception {
        mockMvc.perform(get("/login")).andExpect(status().isOk());
        mockMvc.perform(get("/register")).andExpect(status().isOk());
        mockMvc.perform(get("/forgot-password")).andExpect(status().isOk());
        mockMvc.perform(get("/reset-password")).andExpect(status().isOk());
    }

    @Test
    void loginWithSupabaseSignsTheUserIn() throws Exception {
        SupabaseUser user = new SupabaseUser(UUID.randomUUID(), "owner@example.com");
        when(supabase.signIn("owner@example.com", "password123")).thenReturn(user);

        mockMvc.perform(post("/login").with(csrf())
                        .param("email", " Owner@Example.com ")
                        .param("password", "password123"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/"))
                .andExpect(authenticated().withAuthenticationName("owner@example.com"));
    }

    @Test
    void wrongPasswordShowsHowManyAttemptsAreLeft() throws Exception {
        when(supabase.signIn(anyString(), anyString()))
                .thenThrow(new AuthException("Invalid email or password.", true));
        when(loginAttempts.recordFailure("owner@example.com", "127.0.0.1")).thenReturn(new Failure(2, null));

        mockMvc.perform(post("/login").with(csrf())
                        .param("email", "owner@example.com")
                        .param("password", "wrong-password"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Invalid email or password.")))
                .andExpect(content().string(Matchers.containsString("2 attempts left")))
                .andExpect(unauthenticated());
    }

    @Test
    void thirdWrongPasswordLocksTheLogin() throws Exception {
        when(supabase.signIn(anyString(), anyString()))
                .thenThrow(new AuthException("Invalid email or password.", true));
        when(loginAttempts.recordFailure("owner@example.com", "127.0.0.1"))
                .thenReturn(new Failure(0, Instant.now().plus(Duration.ofHours(24))));

        mockMvc.perform(post("/login").with(csrf())
                        .param("email", "owner@example.com")
                        .param("password", "wrong-password"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Too many failed attempts. Try again in 24 h")))
                .andExpect(content().string(Matchers.containsString("Reset your password")))
                .andExpect(unauthenticated());
    }

    @Test
    void lockedLoginNeverReachesSupabase() throws Exception {
        when(loginAttempts.lockedUntil("owner@example.com", "127.0.0.1"))
                .thenReturn(Optional.of(Instant.now().plus(Duration.ofMinutes(90))));

        mockMvc.perform(post("/login").with(csrf())
                        .param("email", "Owner@Example.com")
                        .param("password", "password123"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Try again in 1 h 30 min")))
                .andExpect(unauthenticated());
        verify(supabase, never()).signIn(anyString(), anyString());
    }

    @Test
    void otherLoginErrorsDoNotCountAsFailures() throws Exception {
        when(supabase.signIn(anyString(), anyString()))
                .thenThrow(new AuthException("Please confirm your email first."));

        mockMvc.perform(post("/login").with(csrf())
                        .param("email", "owner@example.com")
                        .param("password", "password123"))
                .andExpect(content().string(Matchers.containsString("Please confirm your email first.")));
        verify(loginAttempts, never()).recordFailure(anyString(), anyString());
    }

    @Test
    void successfulLoginClearsFailedAttempts() throws Exception {
        when(supabase.signIn("owner@example.com", "password123"))
                .thenReturn(new SupabaseUser(UUID.randomUUID(), "owner@example.com"));

        mockMvc.perform(post("/login").with(csrf())
                        .param("email", "owner@example.com")
                        .param("password", "password123"))
                .andExpect(redirectedUrl("/"));
        verify(loginAttempts).clear("owner@example.com", "127.0.0.1");
    }

    @Test
    void passwordResetUnlocksTheEmail() throws Exception {
        when(supabase.updatePassword("token", "NewPass#99")).thenReturn("owner@example.com");

        mockMvc.perform(post("/reset-password").with(csrf())
                        .param("accessToken", "token")
                        .param("password", "NewPass#99")
                        .param("confirmPassword", "NewPass#99"))
                .andExpect(redirectedUrl("/login?reset"));
        verify(loginAttempts).clearEmail("owner@example.com");
    }

    @Test
    void lockTimeIsShownInHoursAndMinutes() {
        assertThat(AuthController.timeLeft(Duration.ofHours(24))).isEqualTo("24 h");
        assertThat(AuthController.timeLeft(Duration.ofMinutes(23 * 60 + 41))).isEqualTo("23 h 41 min");
        assertThat(AuthController.timeLeft(Duration.ofSeconds(30))).isEqualTo("1 min");
        assertThat(AuthController.timeLeft(Duration.ofMinutes(-5))).isEqualTo("1 min");
    }

    @Test
    void registerWithoutCsrfTokenIsRejected() throws Exception {
        mockMvc.perform(post("/register")
                        .param("email", "new@example.com")
                        .param("password", "Pantry#2026")
                        .param("confirmPassword", "Pantry#2026"))
                .andExpect(status().isForbidden());
        verify(supabase, never()).signUp(anyString(), anyString(), anyString());
    }

    @Test
    void registerAsksTheUserToConfirmTheirEmail() throws Exception {
        when(supabase.signUp(eq("new@example.com"), eq("Pantry#2026"), anyString())).thenReturn(true);

        mockMvc.perform(post("/register").with(csrf())
                        .param("email", "new@example.com")
                        .param("password", "Pantry#2026")
                        .param("confirmPassword", "Pantry#2026"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login?confirm"));
    }

    @Test
    void registerRejectsAPasswordWithoutASymbol() throws Exception {
        mockMvc.perform(post("/register").with(csrf())
                        .param("email", "new@example.com")
                        .param("password", "password123")
                        .param("confirmPassword", "password123"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Password needs a symbol (like ! @ # $).")));
        verify(supabase, never()).signUp(anyString(), anyString(), anyString());
    }

    @Test
    void resetRejectsAWeakPassword() throws Exception {
        mockMvc.perform(post("/reset-password").with(csrf())
                        .param("accessToken", "token")
                        .param("password", "abcdefgh")
                        .param("confirmPassword", "abcdefgh"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Password needs a number and a symbol")));
        verify(supabase, never()).updatePassword(anyString(), anyString());
    }

    @Test
    void passwordRulesNameEverythingThatIsMissing() {
        assertThat(AuthController.passwordProblem("Pantry#2026")).isNull();
        assertThat(AuthController.passwordProblem("ñandú#99x")).isNull();
        assertThat(AuthController.passwordProblem("")).isEqualTo(
                "Password needs at least 8 characters, a letter, a number and a symbol (like ! @ # $).");
        assertThat(AuthController.passwordProblem("12345678!")).isEqualTo("Password needs a letter.");
        assertThat(AuthController.passwordProblem("abc1!")).isEqualTo("Password needs at least 8 characters.");
        assertThat(AuthController.passwordProblem("abcd 1234")).isEqualTo("Password needs a symbol (like ! @ # $).");
        assertThat(AuthController.passwordProblem(null)).startsWith("Password needs at least 8 characters");
    }
}
