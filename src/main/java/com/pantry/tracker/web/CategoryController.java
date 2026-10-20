package com.pantry.tracker.web;

import com.pantry.tracker.service.CategoryService;
import com.pantry.tracker.service.UserService;
import java.util.UUID;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class CategoryController {

    private final UserService userService;
    private final CategoryService categoryService;

    public CategoryController(UserService userService, CategoryService categoryService) {
        this.userService = userService;
        this.categoryService = categoryService;
    }

    @GetMapping("/categories")
    public String categories(Model model) {
        UUID userId = userService.currentId();
        model.addAttribute("rows", categoryService.rows(userId));
        model.addAttribute("groups", categoryService.groups(userId));
        return "categories";
    }

    @PostMapping("/categories")
    public String create(@RequestParam String name, @RequestParam(required = false) String groupName,
                         @RequestParam(required = false) Integer amount,
                         @RequestParam(defaultValue = "days") String unit,
                         @RequestParam(defaultValue = "false") boolean manual, RedirectAttributes ra) {
        try {
            categoryService.create(userService.currentId(), name, groupName, amount, unit, manual);
            ra.addFlashAttribute("success", "Added " + name.trim());
        } catch (IllegalArgumentException ex) {
            ra.addFlashAttribute("error", ex.getMessage());
        }
        return "redirect:/categories";
    }

    @PostMapping("/categories/{id}")
    public String update(@PathVariable Long id, @RequestParam String name,
                         @RequestParam(required = false) String groupName,
                         @RequestParam(required = false) Integer amount,
                         @RequestParam(defaultValue = "days") String unit,
                         @RequestParam(defaultValue = "false") boolean manual, RedirectAttributes ra) {
        try {
            categoryService.update(userService.currentId(), id, name, groupName, amount, unit, manual);
            ra.addFlashAttribute("success", "Saved " + name.trim());
        } catch (IllegalArgumentException ex) {
            ra.addFlashAttribute("error", ex.getMessage());
        }
        return "redirect:/categories";
    }

    @PostMapping("/categories/{id}/delete")
    public String delete(@PathVariable Long id, RedirectAttributes ra) {
        try {
            ra.addFlashAttribute("success", "Deleted " + categoryService.delete(userService.currentId(), id));
        } catch (IllegalArgumentException ex) {
            ra.addFlashAttribute("error", ex.getMessage());
        }
        return "redirect:/categories";
    }
}
