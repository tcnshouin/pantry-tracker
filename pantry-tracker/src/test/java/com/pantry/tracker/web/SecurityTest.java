package com.pantry.tracker.web;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pantry.tracker.config.AppConfig;
import com.pantry.tracker.service.GroceryService;
import com.pantry.tracker.service.InventoryService;
import com.pantry.tracker.service.UserService;
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
    private UserService userService;

    @MockitoBean
    private InventoryService inventoryService;

    @MockitoBean
    private GroceryService groceryService;

    @Test
    void pagesRedirectToLoginWhenNotSignedIn() throws Exception {
        mockMvc.perform(get("/")).andExpect(status().is3xxRedirection()).andExpect(redirectedUrl("/login"));
        mockMvc.perform(get("/grocery")).andExpect(status().is3xxRedirection()).andExpect(redirectedUrl("/login"));
    }

    @Test
    void registerWithoutCsrfTokenIsRejected() throws Exception {
        mockMvc.perform(post("/register")
                        .param("email", "new@example.com")
                        .param("password", "password123")
                        .param("confirmPassword", "password123"))
                .andExpect(status().isForbidden());
    }

    @Test
    void registerWithCsrfTokenGoesToLogin() throws Exception {
        mockMvc.perform(post("/register").with(csrf())
                        .param("email", "new@example.com")
                        .param("password", "password123")
                        .param("confirmPassword", "password123"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login?registered"));
    }
}
