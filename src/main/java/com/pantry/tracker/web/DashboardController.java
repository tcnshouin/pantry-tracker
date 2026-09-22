package com.pantry.tracker.web;

import com.pantry.tracker.dashboard.DashboardService;
import com.pantry.tracker.grocery.GroceryListService;
import com.pantry.tracker.inventory.CurrentUserService;
import com.pantry.tracker.user.User;
import java.time.LocalDate;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardController {

    private final CurrentUserService currentUser;
    private final GroceryListService groceryService;
    private final DashboardService dashboardService;

    public DashboardController(CurrentUserService currentUser, GroceryListService groceryService,
                              DashboardService dashboardService) {
        this.currentUser = currentUser;
        this.groceryService = groceryService;
        this.dashboardService = dashboardService;
    }

    @GetMapping("/")
    public String dashboard(Model model) {
        User user = currentUser.require();
        groceryService.syncAutoSuggestions(user);
        model.addAttribute("dashboard", dashboardService.build(user, LocalDate.now()));
        return "dashboard";
    }
}
