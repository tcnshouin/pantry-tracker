package com.pantry.tracker.web;

import com.pantry.tracker.model.SupabaseUser;
import com.pantry.tracker.service.SupabaseAuthClient;
import com.pantry.tracker.service.SupabaseAuthClient.AuthException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
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
    private final SecurityContextRepository contextRepository = new HttpSessionSecurityContextRepository();

    public AuthController(SupabaseAuthClient supabase) {
        this.supabase = supabase;
    }

    @GetMapping("/login")
    public String login(Model model) {
        model.addAttribute("hideTopbar", true);
        return "auth/login";
    }

    @PostMapping("/login")
    public String login(@RequestParam String email, @RequestParam String password, Model model,
                        HttpServletRequest request, HttpServletResponse response) {
        try {
            SupabaseUser user = supabase.signIn(SupabaseAuthClient.normalizeEmail(email), password);
            signIn(user, request, response);
            return "redirect:/";
        } catch (AuthException ex) {
            model.addAttribute("error", ex.getMessage());
            model.addAttribute("email", email);
            model.addAttribute("hideTopbar", true);
            return "auth/login";
        }
    }

    @GetMapping("/register")
    public String registerForm(Model model) {
        model.addAttribute("registerForm", new RegisterForm());
        return "auth/register";
    }

    @PostMapping("/register")
    public String register(@Valid @ModelAttribute("registerForm") RegisterForm form, BindingResult result) {
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
        if (password.length() < 8) {
            error = "Password must be at least 8 characters";
        } else if (!password.equals(confirmPassword)) {
            error = "Passwords do not match";
        } else if (accessToken.isBlank()) {
            error = "This reset link is missing its token. Request a new one.";
        }
        if (error == null) {
            try {
                supabase.updatePassword(accessToken, password);
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
        private String email;

        @NotBlank
        @Size(min = 8, message = "Password must be at least 8 characters")
        private String password;

        @NotBlank
        private String confirmPassword;
    }
}
