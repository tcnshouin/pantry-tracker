package com.pantry.tracker.web;

import com.pantry.tracker.model.SupabaseUser;
import com.pantry.tracker.service.InputLimits;
import com.pantry.tracker.service.LoginAttemptService;
import com.pantry.tracker.service.LoginAttemptService.Failure;
import com.pantry.tracker.service.SupabaseAuthClient;
import com.pantry.tracker.service.SupabaseAuthClient.AuthException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Controller
public class AuthController {

    private final SupabaseAuthClient supabase;
    private final LoginAttemptService loginAttempts;
    private final SecurityContextRepository contextRepository = new HttpSessionSecurityContextRepository();

    public AuthController(SupabaseAuthClient supabase, LoginAttemptService loginAttempts) {
        this.supabase = supabase;
        this.loginAttempts = loginAttempts;
    }

    @GetMapping("/login")
    public String login(Model model) {
        model.addAttribute("hideTopbar", true);
        return "auth/login";
    }

    @PostMapping("/login")
    public String login(@RequestParam String email, @RequestParam String password, Model model,
                        HttpServletRequest request, HttpServletResponse response) {
        String normalized = SupabaseAuthClient.normalizeEmail(email);
        String ip = request.getRemoteAddr();
        model.addAttribute("email", email);
        model.addAttribute("hideTopbar", true);
        Optional<Instant> lockedUntil = loginAttempts.lockedUntil(normalized, ip);
        if (lockedUntil.isPresent()) {
            return locked(model, lockedUntil.get());
        }
        try {
            SupabaseUser user = supabase.signIn(normalized, password);
            loginAttempts.clear(normalized, ip);
            signIn(user, request, response);
            return "redirect:/";
        } catch (AuthException ex) {
            if (!ex.isWrongPassword()) {
                model.addAttribute("error", ex.getMessage());
                return "auth/login";
            }
            Failure failure = loginAttempts.recordFailure(normalized, ip);
            if (failure.locked()) {
                return locked(model, failure.lockedUntil());
            }
            model.addAttribute("error", ex.getMessage() + " " + failure.attemptsLeft()
                    + (failure.attemptsLeft() == 1 ? " attempt" : " attempts")
                    + " left before this login is locked for 24 hours.");
            return "auth/login";
        }
    }

    private String locked(Model model, Instant until) {
        model.addAttribute("error", "Too many failed attempts. Try again in "
                + timeLeft(Duration.between(Instant.now(), until)) + ", or reset your password.");
        model.addAttribute("locked", true);
        return "auth/login";
    }

    static String passwordProblem(String password) {
        String value = password == null ? "" : password;
        List<String> missing = new ArrayList<>();
        if (value.length() > InputLimits.PASSWORD) {
            return "Password can be at most " + InputLimits.PASSWORD + " characters.";
        }
        if (value.length() < 8) {
            missing.add("at least 8 characters");
        }
        if (value.chars().noneMatch(Character::isLetter)) {
            missing.add("a letter");
        }
        if (value.chars().noneMatch(Character::isDigit)) {
            missing.add("a number");
        }
        if (value.chars().noneMatch(c -> !Character.isLetterOrDigit(c) && !Character.isWhitespace(c))) {
            missing.add("a symbol (like ! @ # $)");
        }
        if (missing.isEmpty()) {
            return null;
        }
        String list = missing.size() == 1 ? missing.get(0)
                : String.join(", ", missing.subList(0, missing.size() - 1)) + " and " + missing.getLast();
        return "Password needs " + list + ".";
    }

    static String timeLeft(Duration left) {
        long minutes = Math.max(1, (left.toSeconds() + 59) / 60);
        long hours = minutes / 60;
        long rest = minutes % 60;
        if (hours == 0) {
            return rest + " min";
        }
        return rest == 0 ? hours + " h" : hours + " h " + rest + " min";
    }

    @GetMapping("/register")
    public String registerForm(Model model) {
        model.addAttribute("registerForm", new RegisterForm());
        return "auth/register";
    }

    @PostMapping("/register")
    public String register(@Valid @ModelAttribute("registerForm") RegisterForm form, BindingResult result) {
        String weakness = passwordProblem(form.getPassword());
        if (form.getPassword() != null && !form.getPassword().isEmpty() && weakness != null) {
            result.rejectValue("password", "password.weak", weakness);
        }
        if (form.getPassword() != null && !form.getPassword().equals(form.getConfirmPassword())) {
            result.rejectValue("confirmPassword", "password.mismatch", "Passwords do not match");
        }
        if (result.hasErrors()) {
            return "auth/register";
        }
        try {
            String redirectTo = ServletUriComponentsBuilder.fromCurrentContextPath().path("/login").toUriString();
            boolean needsConfirmation = supabase.signUp(SupabaseAuthClient.normalizeEmail(form.getEmail()),
                    form.getPassword(), redirectTo);
            return needsConfirmation ? "redirect:/login?confirm" : "redirect:/login?registered";
        } catch (AuthException ex) {
            result.reject("supabase", ex.getMessage());
            return "auth/register";
        }
    }

    @GetMapping("/forgot-password")
    public String forgotPassword() {
        return "auth/forgot-password";
    }

    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestParam String email, Model model) {
        String redirectTo = ServletUriComponentsBuilder.fromCurrentContextPath().path("/reset-password").toUriString();
        try {
            supabase.sendPasswordReset(SupabaseAuthClient.normalizeEmail(email), redirectTo);
            model.addAttribute("sent", true);
        } catch (AuthException ex) {
            model.addAttribute("error", ex.getMessage());
        }
        return "auth/forgot-password";
    }

    @GetMapping("/reset-password")
    public String resetPassword() {
        return "auth/reset-password";
    }

    @PostMapping("/reset-password")
    public String resetPassword(@RequestParam String accessToken, @RequestParam String password,
                                @RequestParam String confirmPassword, Model model) {
        String error = null;
        String weakness = passwordProblem(password);
        if (weakness != null) {
            error = weakness;
        } else if (!password.equals(confirmPassword)) {
            error = "Passwords do not match";
        } else if (accessToken.isBlank()) {
            error = "This reset link is missing its token. Request a new one.";
        }
        if (error == null) {
            try {
                String email = supabase.updatePassword(accessToken, password);
                if (email != null) {
                    loginAttempts.clearEmail(email);
                }
                return "redirect:/login?reset";
            } catch (AuthException ex) {
                error = ex.getMessage();
            }
        }
        model.addAttribute("error", error);
        model.addAttribute("accessToken", accessToken);
        return "auth/reset-password";
    }

    private void signIn(SupabaseUser user, HttpServletRequest request, HttpServletResponse response) {
        if (request.getSession(false) != null) {
            request.changeSessionId();
        }
        UsernamePasswordAuthenticationToken auth = UsernamePasswordAuthenticationToken.authenticated(
                user, null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);
        contextRepository.saveContext(context, request, response);
    }

    @Getter
    @Setter
    public static class RegisterForm {

        @NotBlank
        @Email
        @Size(max = InputLimits.EMAIL, message = "Email can be at most " + InputLimits.EMAIL + " characters")
        private String email;

        @NotBlank
        private String password;

        @NotBlank
        private String confirmPassword;
    }
}
