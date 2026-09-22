package com.pantry.tracker.inventory;

import com.pantry.tracker.category.CategoryService;
import com.pantry.tracker.inventory.InventoryExceptions.DuplicateGroupNameException;
import com.pantry.tracker.inventory.InventoryExceptions.GroupNotEmptyException;
import com.pantry.tracker.inventory.InventoryExceptions.NoExpiryReferenceException;
import com.pantry.tracker.inventory.InventoryViews.DuplicatePrompt;
import com.pantry.tracker.inventory.InventoryViews.ItemView;
import com.pantry.tracker.inventory.InventoryViews.LocationGroupView;
import com.pantry.tracker.user.User;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class InventoryController {

    private static final String GROUP_BODY = "inventory/fragments :: groupBody";

    private final CurrentUserService currentUser;
    private final LocationGroupService groupService;
    private final ItemService itemService;
    private final BatchService batchService;
    private final CategoryService categoryService;

    public InventoryController(CurrentUserService currentUser, LocationGroupService groupService,
                               ItemService itemService, BatchService batchService,
                               CategoryService categoryService) {
        this.currentUser = currentUser;
        this.groupService = groupService;
        this.itemService = itemService;
        this.batchService = batchService;
        this.categoryService = categoryService;
    }

    @GetMapping("/inventory")
    public String inventory(Model model) {
        User user = currentUser.require();
        model.addAttribute("groups", groupService.listGroupsWithItems(user));
        model.addAttribute("categories", categoryService.listOptions());
        return "inventory/inventory";
    }

    @PostMapping("/locations")
    public String createGroup(@RequestParam String name, RedirectAttributes ra) {
        User user = currentUser.require();
        try {
            groupService.create(user, name);
            ra.addFlashAttribute("success", "Group created");
        } catch (DuplicateGroupNameException | IllegalArgumentException ex) {
            ra.addFlashAttribute("error", ex.getMessage());
        }
        return "redirect:/inventory";
    }

    @PostMapping("/locations/{id}/rename")
    public String renameGroup(@PathVariable Long id, @RequestParam String name, RedirectAttributes ra) {
        User user = currentUser.require();
        try {
            groupService.rename(user, id, name);
            ra.addFlashAttribute("success", "Group renamed");
        } catch (DuplicateGroupNameException | IllegalArgumentException ex) {
            ra.addFlashAttribute("error", ex.getMessage());
        }
        return "redirect:/inventory";
    }

    @PostMapping("/locations/{id}/delete")
    public String deleteGroup(@PathVariable Long id, RedirectAttributes ra) {
        User user = currentUser.require();
        try {
            groupService.delete(user, id);
            ra.addFlashAttribute("success", "Group deleted");
        } catch (GroupNotEmptyException ex) {
            ra.addFlashAttribute("error", ex.getMessage());
        }
        return "redirect:/inventory";
    }

    @GetMapping("/locations/{id}/items")
    public String groupItems(@PathVariable Long id, Model model) {
        User user = currentUser.require();
        return renderGroupBody(user, id, model, null, null);
    }

    @PostMapping("/locations/{id}/items")
    public String addItem(@PathVariable Long id,
                          @RequestParam String name,
                          @RequestParam(required = false) Long categoryId,
                          @RequestParam(defaultValue = "1") int quantity,
                          @RequestParam(required = false) String expirationDate,
                          @RequestParam(defaultValue = "false") boolean autoExpiry,
                          Model model) {
        User user = currentUser.require();
        String trimmed = name == null ? "" : name.trim();
        if (trimmed.isEmpty() || categoryId == null) {
            return renderGroupBody(user, id, model, null, "Enter a name and choose a category");
        }
        Optional<Item> duplicate = itemService.findDuplicate(user, trimmed, categoryId, id);
        if (duplicate.isPresent()) {
            DuplicatePrompt prompt = new DuplicatePrompt(itemService.view(user, duplicate.get().getId()),
                    trimmed, categoryId, quantity, expirationDate == null ? "" : expirationDate, autoExpiry);
            return renderGroupBody(user, id, model, prompt, null);
        }
        try {
            itemService.createItemWithBatch(user, id, trimmed, categoryId, Math.max(0, quantity),
                    parseDate(expirationDate), autoExpiry);
        } catch (NoExpiryReferenceException ex) {
            return renderGroupBody(user, id, model, null, ex.getMessage());
        }
        return renderGroupBody(user, id, model, null, null);
    }

    @PostMapping("/items/{id}")
    public String editItem(@PathVariable Long id, @RequestParam String name,
                           @RequestParam Long categoryId,
                           @RequestParam(defaultValue = "false") boolean lowStockEnabled,
                           @RequestParam(required = false) Integer lowStockThreshold, Model model) {
        User user = currentUser.require();
        Long groupId = itemService.updateItem(user, id, name, categoryId, lowStockEnabled,
                lowStockThreshold);
        return renderGroupBody(user, groupId, model, null, null);
    }

    @PostMapping("/items/{id}/delete")
    public String deleteItem(@PathVariable Long id, Model model) {
        User user = currentUser.require();
        Long groupId = itemService.deleteItem(user, id);
        return renderGroupBody(user, groupId, model, null, null);
    }

    @PostMapping("/items/{id}/batches")
    public String addBatch(@PathVariable Long id, @RequestParam(defaultValue = "1") int quantity,
                           @RequestParam(required = false) String expirationDate,
                           @RequestParam(defaultValue = "false") boolean autoExpiry, Model model) {
        User user = currentUser.require();
        try {
            Long groupId = batchService.addBatch(user, id, Math.max(0, quantity),
                    parseDate(expirationDate), autoExpiry);
            return renderGroupBody(user, groupId, model, null, null);
        } catch (NoExpiryReferenceException ex) {
            return renderGroupBody(user, itemService.groupIdOfItem(user, id), model, null, ex.getMessage());
        }
    }

    @PostMapping("/batches/{id}")
    public String updateBatch(@PathVariable Long id, @RequestParam int quantity,
                              @RequestParam(required = false) String expirationDate,
                              @RequestParam(required = false) String dateAdded,
                              @RequestParam(defaultValue = "false") boolean autoExpiry, Model model) {
        User user = currentUser.require();
        try {
            Long groupId = batchService.updateBatch(user, id, quantity, parseDate(expirationDate),
                    parseDate(dateAdded), autoExpiry);
            return renderGroupBody(user, groupId, model, null, null);
        } catch (NoExpiryReferenceException ex) {
            return renderGroupBody(user, batchService.groupIdOfBatch(user, id), model, null, ex.getMessage());
        }
    }

    @PostMapping("/batches/{id}/quantity")
    public String adjustQuantity(@PathVariable Long id, @RequestParam int delta, Model model) {
        User user = currentUser.require();
        Long groupId = batchService.adjustQuantity(user, id, delta);
        return renderGroupBody(user, groupId, model, null, null);
    }

    @PostMapping("/batches/{id}/delete")
    public String deleteBatch(@PathVariable Long id, Model model) {
        User user = currentUser.require();
        Long groupId = batchService.deleteBatch(user, id);
        return renderGroupBody(user, groupId, model, null, null);
    }

    private String renderGroupBody(User user, Long groupId, Model model, DuplicatePrompt prompt,
                                   String addError) {
        LocationGroup group = groupService.require(user, groupId);
        List<ItemView> items = itemService.listItems(user, group);
        model.addAttribute("group", new LocationGroupView(group.getId(), group.getName(), items.size()));
        model.addAttribute("items", items);
        model.addAttribute("categories", categoryService.listOptions());
        model.addAttribute("prompt", prompt);
        model.addAttribute("addError", addError);
        return GROUP_BODY;
    }

    private static LocalDate parseDate(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        return LocalDate.parse(raw);
    }
}
