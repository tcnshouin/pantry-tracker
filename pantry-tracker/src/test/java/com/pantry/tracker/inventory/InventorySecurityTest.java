package com.pantry.tracker.inventory;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pantry.tracker.category.CategoryService;
import com.pantry.tracker.config.SecurityConfig;
import com.pantry.tracker.undo.UndoExecutor;
import com.pantry.tracker.undo.UndoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = InventoryController.class)
@Import(SecurityConfig.class)
class InventorySecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CurrentUserService currentUserService;

    @MockitoBean
    private LocationGroupService locationGroupService;

    @MockitoBean
    private ItemService itemService;

    @MockitoBean
    private BatchService batchService;

    @MockitoBean
    private CategoryService categoryService;

    @MockitoBean
    private UndoService undoService;

    @MockitoBean
    private UndoExecutor undoExecutor;

    @Test
    void anonymousInventoryRedirectsToLogin() throws Exception {
        mockMvc.perform(get("/inventory"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login"));
    }
}
