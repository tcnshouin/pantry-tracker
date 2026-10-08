package com.pantry.tracker.web;

import com.pantry.tracker.model.User;
import com.pantry.tracker.service.GroceryService;
import com.pantry.tracker.service.UserService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

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
        User user = userService.current();
        groceryService.syncAutoSuggestions(user);
        model.addAttribute("list", groceryService.list(user));
        return "grocery/grocery";
    }

    @PostMapping("/items/{itemId}/grocery")
    public String addFromInventory(@PathVariable Long itemId, @RequestParam(defaultValue = "1") int quantity) {
        groceryService.addManual(userService.current(), itemId, quantity);
        return "grocery/fragments :: addedBadge";
    }

    @PostMapping("/grocery/{id}/purchase")
    public String purchase(@PathVariable Long id, Model model) {
        User user = userService.current();
        groceryService.togglePurchased(user, id);
        return body(user, model);
    }

    @PostMapping("/grocery/{id}/remove")
    public String remove(@PathVariable Long id, Model model) {
        User user = userService.current();
        groceryService.remove(user, id);
        return body(user, model);
    }

    @PostMapping("/grocery/{id}/restock")
    public String restock(@PathVariable Long id, Model model) {
        User user = userService.current();
        groceryService.restock(user, id);
        return body(user, model);
    }

    private String body(User user, Model model) {
        model.addAttribute("list", groceryService.list(user));
        return "grocery/fragments :: groceryBody";
    }
}
