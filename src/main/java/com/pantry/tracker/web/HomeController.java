package com.pantry.tracker.web;

import com.pantry.tracker.model.Views.DuplicatePrompt;
import com.pantry.tracker.model.Views.GroupWithItems;
import com.pantry.tracker.model.Views.ItemView;
import com.pantry.tracker.service.DataStructures.UndoAction;
import com.pantry.tracker.service.DataStructures.UndoStack;
import com.pantry.tracker.service.GroceryService;
import com.pantry.tracker.service.InventoryService;
import com.pantry.tracker.service.UserService;
import jakarta.servlet.http.HttpSession;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class HomeController {

    private final UserService userService;
    private final InventoryService inventory;
    private final GroceryService groceryService;

    public HomeController(UserService userService, InventoryService inventory, GroceryService groceryService) {
        this.userService = userService;
        this.inventory = inventory;
        this.groceryService = groceryService;
    }

    @GetMapping("/")
    public String home(Model model, HttpSession session) {
        UUID userId = userService.currentId();
        groceryService.syncAutoSuggestions(userId);
        model.addAttribute("overview", inventory.overview(userId));
        model.addAttribute("groups", inventory.groupsWithItems(userId));
        model.addAttribute("categories", inventory.categoryOptions());
        model.addAttribute("undoLabel", undoStack(session).peekLabel());
        return "home";
    }

    @GetMapping("/inventory")
    public String inventoryRedirect() {
        return "redirect:/";
    }

    @PostMapping("/locations")
    public String createGroup(@RequestParam String name, RedirectAttributes ra) {
        try {
            Long id = inventory.createGroup(userService.currentId(), name).getId();
            ra.addFlashAttribute("success", "Group created");
            return "redirect:/#group-card-" + id;
        } catch (IllegalArgumentException ex) {
            ra.addFlashAttribute("error", ex.getMessage());
        }
        return "redirect:/";
    }

    @PostMapping("/locations/{id}/rename")
    public String renameGroup(@PathVariable Long id, @RequestParam String name, RedirectAttributes ra) {
        try {
            inventory.renameGroup(userService.currentId(), id, name);
            ra.addFlashAttribute("success", "Group renamed");
        } catch (IllegalArgumentException ex) {
            ra.addFlashAttribute("error", ex.getMessage());
        }
        return "redirect:/#group-card-" + id;
    }

    @PostMapping("/locations/{id}/delete")
    public String deleteGroup(@PathVariable Long id, RedirectAttributes ra) {
        try {
            inventory.deleteGroup(userService.currentId(), id);
            ra.addFlashAttribute("success", "Group deleted");
        } catch (IllegalArgumentException ex) {
            ra.addFlashAttribute("error", ex.getMessage());
        }
        return "redirect:/";
    }

    @PostMapping("/locations/{id}/items")
    public String addItem(@PathVariable Long id, @RequestParam String name,
                          @RequestParam(required = false) Long categoryId,
                          @RequestParam(defaultValue = "1") int quantity,
                          @RequestParam(required = false) String expirationDate,
                          @RequestParam(defaultValue = "false") boolean autoExpiry,
                          Model model, HttpSession session) {
        UUID userId = userService.currentId();
        String trimmed = name == null ? "" : name.trim();
        if (trimmed.isEmpty() || categoryId == null) {
            return groupBody(userId, id, model, session, null, "Enter a name and choose a category");
        }
        ItemView existing = inventory.findDuplicate(userId, trimmed, categoryId, id);
        if (existing != null) {
            DuplicatePrompt prompt = new DuplicatePrompt(existing, trimmed, categoryId, quantity,
                    expirationDate == null ? "" : expirationDate, autoExpiry);
            return groupBody(userId, id, model, session, prompt, null);
        }
        try {
            inventory.createItem(userId, id, trimmed, categoryId, quantity, parseDate(expirationDate), autoExpiry,
                    undoStack(session));
            return groupBody(userId, id, model, session, null, null);
        } catch (IllegalArgumentException ex) {
            return groupBody(userId, id, model, session, null, ex.getMessage());
        }
    }

    @PostMapping("/items/{id}")
    public String editItem(@PathVariable Long id, @RequestParam String name, @RequestParam Long categoryId,
                           @RequestParam(defaultValue = "false") boolean lowStockEnabled,
                           @RequestParam(required = false) Integer lowStockThreshold,
                           Model model, HttpSession session) {
        UUID userId = userService.currentId();
        Long groupId = inventory.updateItem(userId, id, name, categoryId, lowStockEnabled, lowStockThreshold,
                undoStack(session));
        return groupBody(userId, groupId, model, session, null, null);
    }

    @PostMapping("/items/{id}/delete")
    public String deleteItem(@PathVariable Long id, Model model, HttpSession session) {
        UUID userId = userService.currentId();
        Long groupId = inventory.deleteItem(userId, id, undoStack(session));
        return groupBody(userId, groupId, model, session, null, null);
    }

    @PostMapping("/items/{id}/keep")
    public String keepItem(@PathVariable Long id, Model model, HttpSession session) {
        UUID userId = userService.currentId();
        return groupBody(userId, inventory.keepItem(userId, id), model, session, null, null);
    }

    @PostMapping("/items/{id}/batches")
    public String addBatch(@PathVariable Long id, @RequestParam(defaultValue = "1") int quantity,
                           @RequestParam(required = false) String expirationDate,
                           @RequestParam(defaultValue = "false") boolean autoExpiry,
                           Model model, HttpSession session) {
        UUID userId = userService.currentId();
        Long groupId = inventory.groupIdOfItem(userId, id);
        try {
            inventory.addBatch(userId, id, quantity, parseDate(expirationDate), autoExpiry, undoStack(session));
            return groupBody(userId, groupId, model, session, null, null);
        } catch (IllegalArgumentException ex) {
            return groupBody(userId, groupId, model, session, null, ex.getMessage());
        }
    }

    @PostMapping("/batches/{id}")
    public String updateBatch(@PathVariable Long id, @RequestParam int quantity,
                              @RequestParam(required = false) String expirationDate,
                              @RequestParam(required = false) String dateAdded,
                              @RequestParam(defaultValue = "false") boolean autoExpiry,
                              Model model, HttpSession session) {
        UUID userId = userService.currentId();
        Long groupId = inventory.groupIdOfBatch(userId, id);
        try {
            inventory.updateBatch(userId, id, quantity, parseDate(expirationDate), parseDate(dateAdded), autoExpiry,
                    undoStack(session));
            return groupBody(userId, groupId, model, session, null, null);
        } catch (IllegalArgumentException ex) {
            return groupBody(userId, groupId, model, session, null, ex.getMessage());
        }
    }

    @PostMapping("/batches/{id}/quantity")
    public String adjustQuantity(@PathVariable Long id, @RequestParam int delta, Model model, HttpSession session) {
        UUID userId = userService.currentId();
        Long groupId = inventory.adjustQuantity(userId, id, delta, undoStack(session));
        return groupBody(userId, groupId, model, session, null, null);
    }

    @PostMapping("/items/{id}/quantity")
    public String adjustItemQuantity(@PathVariable Long id, @RequestParam int delta, Model model, HttpSession session) {
        UUID userId = userService.currentId();
        Long groupId = inventory.adjustItemQuantity(userId, id, delta, undoStack(session));
        return groupBody(userId, groupId, model, session, null, null);
    }

    @PostMapping("/batches/{id}/delete")
    public String deleteBatch(@PathVariable Long id, Model model, HttpSession session) {
        UUID userId = userService.currentId();
        Long groupId = inventory.deleteBatch(userId, id, undoStack(session));
        return groupBody(userId, groupId, model, session, null, null);
    }

    @PostMapping("/batches/{id}/keep")
    public String keepBatch(@PathVariable Long id, Model model, HttpSession session) {
        UUID userId = userService.currentId();
        return groupBody(userId, inventory.keepBatch(userId, id), model, session, null, null);
    }

    @PostMapping("/undo")
    public String undo(HttpSession session, RedirectAttributes ra) {
        UndoAction action = undoStack(session).pop();
        if (action != null) {
            inventory.undo(userService.currentId(), action);
            ra.addFlashAttribute("undone", action.getLabel());
        }
        return "redirect:/";
    }

    private String groupBody(UUID userId, Long groupId, Model model, HttpSession session,
                             DuplicatePrompt prompt, String addError) {
        GroupWithItems body = inventory.groupBody(userId, groupId);
        model.addAttribute("group", body.group());
        model.addAttribute("items", body.items());
        model.addAttribute("categories", inventory.categoryOptions());
        model.addAttribute("prompt", prompt);
        model.addAttribute("addError", addError);
        model.addAttribute("inlineUndo", undoStack(session).peekLabel());
        return "inventory/fragments :: groupBody";
    }

    private UndoStack undoStack(HttpSession session) {
        UndoStack stack = (UndoStack) session.getAttribute("undoStack");
        if (stack == null) {
            stack = new UndoStack();
            session.setAttribute("undoStack", stack);
        }
        return stack;
    }

    private static LocalDate parseDate(String raw) {
        return raw == null || raw.isBlank() ? null : LocalDate.parse(raw);
    }
}
