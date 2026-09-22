package com.pantry.tracker.grocery;

import com.pantry.tracker.grocery.GroceryViews.RestockInfo;
import com.pantry.tracker.inventory.BatchService;
import com.pantry.tracker.inventory.CurrentUserService;
import com.pantry.tracker.user.User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class GroceryController {

    private static final String GROCERY_BODY = "grocery/fragments :: groceryBody";

    private final CurrentUserService currentUser;
    private final GroceryListService groceryService;
    private final BatchService batchService;

    public GroceryController(CurrentUserService currentUser, GroceryListService groceryService,
                             BatchService batchService) {
        this.currentUser = currentUser;
        this.groceryService = groceryService;
        this.batchService = batchService;
    }

    @GetMapping("/grocery")
    public String grocery(Model model) {
        User user = currentUser.require();
        groceryService.syncAutoSuggestions(user);
        model.addAttribute("list", groceryService.list(user));
        return "grocery/grocery";
    }

    @PostMapping("/items/{itemId}/grocery")
    public String addFromInventory(@PathVariable Long itemId,
                                   @RequestParam(defaultValue = "1") int quantity, Model model) {
        User user = currentUser.require();
        groceryService.addManual(user, itemId, quantity);
        return "grocery/fragments :: addedBadge";
    }

    @PostMapping("/grocery/{id}/purchase")
    public String purchase(@PathVariable Long id, Model model) {
        User user = currentUser.require();
        groceryService.togglePurchased(user, id);
        return body(user, model);
    }

    @PostMapping("/grocery/{id}/remove")
    public String remove(@PathVariable Long id, Model model) {
        User user = currentUser.require();
        groceryService.remove(user, id);
        return body(user, model);
    }

    @PostMapping("/grocery/{id}/restock")
    public String restock(@PathVariable Long id, Model model) {
        User user = currentUser.require();
        RestockInfo target = groceryService.restockInfo(user, id);
        batchService.addBatch(user, target.itemId(), target.quantity(), null, true);
        groceryService.remove(user, id);
        return body(user, model);
    }

    private String body(User user, Model model) {
        model.addAttribute("list", groceryService.list(user));
        return GROCERY_BODY;
    }
}
