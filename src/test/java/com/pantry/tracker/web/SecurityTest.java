package com.pantry.tracker.web;

import static org.mockito.ArgumentMatchers.anyString;
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
import com.pantry.tracker.service.SupabaseAuthClient;
import com.pantry.tracker.service.SupabaseAuthClient.AuthException;
import com.pantry.tracker.service.UserService;
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
    void badLoginShowsTheSupabaseMessage() throws Exception {
        when(supabase.signIn(anyString(), anyString())).thenThrow(new AuthException("Invalid email or password."));

        mockMvc.perform(post("/login").with(csrf())
                        .param("email", "owner@example.com")
                        .param("password", "wrong-password"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Invalid email or password.")))
                .andExpect(unauthenticated());
    }

    @Test
    void registerWithoutCsrfTokenIsRejected() throws Exception {
        mockMvc.perform(post("/register")
                        .param("email", "new@example.com")
                        .param("password", "password123")
                        .param("confirmPassword", "password123"))
                .andExpect(status().isForbidden());
        verify(supabase, never()).signUp(anyString(), anyString());
    }

    @Test
    void registerAsksTheUserToConfirmTheirEmail() throws Exception {
        when(supabase.signUp("new@example.com", "password123")).thenReturn(true);

        mockMvc.perform(post("/register").with(csrf())
                        .param("email", "new@example.com")
                        .param("password", "password123")
                        .param("confirmPassword", "password123"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login?confirm"));
    }
}
