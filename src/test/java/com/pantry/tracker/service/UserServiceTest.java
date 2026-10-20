package com.pantry.tracker.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.pantry.tracker.model.SupabaseUser;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

class UserServiceTest {

    private final UserService userService = new UserService();

    @AfterEach
    void clear() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void currentIdComesFromTheSupabaseUser() {
        UUID id = UUID.randomUUID();
        SecurityContextHolder.getContext().setAuthentication(UsernamePasswordAuthenticationToken.authenticated(
                new SupabaseUser(id, "owner@example.com"), null, List.of()));

        assertThat(userService.currentId()).isEqualTo(id);
    }

    @Test
    void currentIdFailsWhenNobodyIsSignedIn() {
        assertThatThrownBy(userService::currentId).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void supabaseErrorsBecomeFriendlyMessages() {
        assertThat(SupabaseAuthClient.friendly("{\"error_code\":\"invalid_credentials\"}"))
                .isEqualTo("Invalid email or password.");
        assertThat(SupabaseAuthClient.friendly("{\"error_code\":\"email_not_confirmed\"}"))
                .startsWith("Please confirm your email");
        assertThat(SupabaseAuthClient.normalizeEmail("  Test@Example.com ")).isEqualTo("test@example.com");
    }
}
