package com.pantry.tracker.web;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.flash;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pantry.tracker.config.AppConfig;
import com.pantry.tracker.model.SupabaseUser;
import com.pantry.tracker.model.Views.GroceryPage;
import com.pantry.tracker.model.Views.GroceryRow;
import com.pantry.tracker.model.Views.GrocerySummary;
import com.pantry.tracker.model.Views.PutAwayEntry;
import com.pantry.tracker.model.Views.QuickAddOption;
import com.pantry.tracker.service.GroceryService;
import com.pantry.tracker.service.UserService;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@WebMvcTest(controllers = GroceryController.class)
@Import(AppConfig.class)
class GroceryPageTest {

    private final UUID userId = UUID.randomUUID();
    private final RequestPostProcessor signedIn = authentication(UsernamePasswordAuthenticationToken.authenticated(
            new SupabaseUser(userId, "owner@example.com"), null, List.of()));

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private GroceryService groceryService;

    @BeforeEach
    void setUp() {
        when(userService.currentId()).thenReturn(userId);
        GroceryPage page = new GroceryPage(
                List.of(new GroceryRow(1L, "Rice", "Grains", 2, true, 11L),
                        new GroceryRow(2L, "Old snack", null, 1, false, null)),
                new GrocerySummary(2, 3, 1, 1),
                List.of(new QuickAddOption(12L, "Eggs", "Fridge", 4)),
                List.of(new PutAwayEntry("Milk", 2, LocalDate.of(2026, 10, 1), "Fridge")));
        when(groceryService.page(userId)).thenReturn(page);
    }

    @Test
    void groceryPageShowsListAndSideCards() throws Exception {
        mockMvc.perform(get("/grocery").with(signedIn))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.allOf(
                        Matchers.containsString("Shopping Summary"),
                        Matchers.containsString("Quick Add"),
                        Matchers.containsString("Recently Stocked"),
                        Matchers.containsString("Rice"),
                        Matchers.containsString("Not in inventory"),
                        Matchers.containsString("Add to Pantry"))));
        verify(groceryService).syncAutoSuggestions(userId);
    }

    @Test
    void quantityChangeReturnsJustTheGroceryBody() throws Exception {
        mockMvc.perform(post("/grocery/1/quantity").with(signedIn).with(csrf()).param("delta", "1"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Shopping Summary")))
                .andExpect(content().string(Matchers.not(Matchers.containsString("<html"))));
        verify(groceryService).changeQuantity(userId, 1L, 1);
    }

    @Test
    void putAwayMovesCheckedItemsAndSaysHowMany() throws Exception {
        when(groceryService.putAway(userId, List.of(1L))).thenReturn(new GroceryService.PutAwayResult(1, 0));

        mockMvc.perform(post("/grocery/put-away").with(signedIn).with(csrf()).param("ids", "1"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/grocery"))
                .andExpect(flash().attribute("success", "Added 1 item to your pantry"));
    }
}
