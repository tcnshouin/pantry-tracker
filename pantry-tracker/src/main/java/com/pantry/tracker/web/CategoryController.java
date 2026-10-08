package com.pantry.tracker.web;

import com.pantry.tracker.service.InventoryService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class CategoryController {

    private final InventoryService inventory;

    public CategoryController(InventoryService inventory) {
        this.inventory = inventory;
    }

    @GetMapping("/categories")
    public String categories(Model model) {
        model.addAttribute("categories", inventory.categoryOptions());
        return "categories";
    }
}
