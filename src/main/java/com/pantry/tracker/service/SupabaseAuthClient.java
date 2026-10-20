package com.pantry.tracker.service;

import com.pantry.tracker.model.SupabaseUser;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.function.Supplier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Service
public class SupabaseAuthClient {

    private final String url;
    private final String anonKey;
    private final RestClient http = RestClient.create();

    public SupabaseAuthClient(@Value("${supabase.url:}") String url, @Value("${supabase.anon-key:}") String anonKey) {
        this.url = url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
        this.anonKey = anonKey;
    }

    public static class AuthException extends RuntimeException {
        public AuthException(String message) {
            super(message);
        }
    }

    public SupabaseUser signIn(String email, String password) {
        Map<?, ?> body = post("/auth/v1/token?grant_type=password", Map.of("email", email, "password", password));
        return toUser((Map<?, ?>) body.get("user"));
    }

    public boolean signUp(String email, String password, String redirectTo) {
        Map<?, ?> body = post("/auth/v1/signup?redirect_to=" + redirectTo, Map.of("email", email, "password", password));
        return body.get("access_token") == null;
    }

    public void sendPasswordReset(String email, String redirectTo) {
        post("/auth/v1/recover?redirect_to=" + redirectTo, Map.of("email", email));
    }

    public void updatePassword(String accessToken, String newPassword) {
        call(() -> http.put()
                .uri(endpoint("/auth/v1/user"))
                .header("apikey", anonKey)
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("password", newPassword))
                .retrieve()
                .body(Map.class));
    }

    public static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private Map<?, ?> post(String path, Map<String, String> payload) {
        return call(() -> http.post()
                .uri(endpoint(path))
                .header("apikey", anonKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(Map.class));
    }

    private String endpoint(String path) {
        if (url.isBlank() || anonKey.isBlank()) {
            throw new AuthException("Login isn't set up yet. Add SUPABASE_URL and SUPABASE_ANON_KEY to your .env file.");
        }
        return url + path;
    }

    private Map<?, ?> call(Supplier<Map<?, ?>> request) {
        try {
            Map<?, ?> body = request.get();
            return body == null ? Map.of() : body;
        } catch (RestClientResponseException ex) {
            throw new AuthException(friendly(ex.getResponseBodyAsString()));
        } catch (ResourceAccessException ex) {
            throw new AuthException("Can't reach Supabase right now. Check your internet connection and try again.");
        }
    }

    static String friendly(String error) {
        String text = error == null ? "" : error.toLowerCase(Locale.ROOT);
        if (text.contains("email_not_confirmed") || text.contains("email not confirmed")) {
            return "Please confirm your email first. Check your inbox for the link from Supabase.";
        }
        if (text.contains("invalid_credentials") || text.contains("invalid login credentials")) {
            return "Invalid email or password.";
        }
        if (text.contains("user_already_exists") || text.contains("already registered")) {
            return "An account already exists for this email.";
        }
        if (text.contains("weak_password") || text.contains("password should be")) {
            return "That password is too weak. Use at least 8 characters.";
        }
        if (text.contains("rate_limit") || text.contains("rate limit")) {
            return "Too many emails sent. Wait a few minutes and try again.";
        }
        if (text.contains("bad_jwt") || text.contains("expired")) {
            return "This reset link has expired. Request a new one.";
        }
        return "Something went wrong talking to Supabase. Please try again.";
    }

    private static SupabaseUser toUser(Map<?, ?> user) {
        if (user == null) {
            throw new AuthException("Supabase didn't return a user. Please try again.");
        }
        return new SupabaseUser(UUID.fromString((String) user.get("id")), (String) user.get("email"));
    }
}
