package com.pantry.tracker.web;

import com.pantry.tracker.service.GroceryService;
import com.pantry.tracker.service.UserService;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class GroceryController {

    private final UserService userService;
    private final GroceryService groceryService;

    public GroceryController(UserService userService, GroceryService groceryService) {
        this.userService = userService;
        this.groceryService = groceryService;
    }

    @GetMapping("/grocery")
    public String grocery(Model model) {
        UUID userId = userService.currentId();
        groceryService.syncAutoSuggestions(userId);
        model.addAttribute("page", groceryService.page(userId));
        return "grocery/grocery";
    }

    @PostMapping("/items/{itemId}/grocery")
    public String addFromInventory(@PathVariable Long itemId, @RequestParam(defaultValue = "1") int quantity) {
        try {
            groceryService.addManual(userService.currentId(), itemId, quantity);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        }
        return "grocery/fragments :: addedBadge";
    }

    @PostMapping("/grocery/add")
    public String quickAdd(@RequestParam Long itemId, Model model) {
        UUID userId = userService.currentId();
        try {
            groceryService.addManual(userId, itemId, 1);
        } catch (IllegalArgumentException ex) {
            model.addAttribute("error", ex.getMessage());
        }
        return body(userId, model);
    }

    @PostMapping("/grocery/{id}/quantity")
    public String changeQuantity(@PathVariable Long id, @RequestParam int delta, Model model) {
        UUID userId = userService.currentId();
        try {
            groceryService.changeQuantity(userId, id, delta);
        } catch (IllegalArgumentException ex) {
            model.addAttribute("error", ex.getMessage());
        }
        return body(userId, model);
    }

    @PostMapping("/grocery/{id}/remove")
    public String remove(@PathVariable Long id, Model model) {
        UUID userId = userService.currentId();
        groceryService.remove(userId, id);
        return body(userId, model);
    }

    @PostMapping("/grocery/put-away")
    public String putAway(@RequestParam(name = "ids", required = false) List<Long> ids, RedirectAttributes ra) {
        if (ids == null || ids.isEmpty()) {
            ra.addFlashAttribute("error", "Tick the items you bought first");
            return "redirect:/grocery";
        }
        GroceryService.PutAwayResult result;
        try {
            result = groceryService.putAway(userService.currentId(), ids);
        } catch (IllegalArgumentException ex) {
            ra.addFlashAttribute("error", ex.getMessage());
            return "redirect:/grocery";
        }
        int count = result.putAway();
        if (count > 0) {
            ra.addFlashAttribute("success", "Added " + count + (count == 1 ? " item" : " items")
                    + " to your pantry");
        }
        if (result.needDate() > 0) {
            ra.addFlashAttribute("error", result.needDate() + (result.needDate() == 1 ? " item has" : " items have")
                    + " no set shelf life. Add " + (result.needDate() == 1 ? "it" : "them")
                    + " from the inventory page with an expiration date.");
        }
        return "redirect:/grocery";
    }

    private String body(UUID userId, Model model) {
        model.addAttribute("page", groceryService.page(userId));
        return "grocery/fragments :: groceryBody";
    }
}
