package com.pantry.tracker.service;

import com.pantry.tracker.model.Category;
import com.pantry.tracker.model.Views;
import com.pantry.tracker.model.Views.CategoryOption;
import com.pantry.tracker.model.Views.CategoryRow;
import com.pantry.tracker.repository.CategoryRepository;
import com.pantry.tracker.repository.ItemRepository;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ItemRepository itemRepository;

    public CategoryService(CategoryRepository categoryRepository, ItemRepository itemRepository) {
        this.categoryRepository = categoryRepository;
        this.itemRepository = itemRepository;
    }

    @Transactional
    public List<CategoryOption> options(UUID userId) {
        ensureDefaults(userId);
        List<CategoryOption> options = new ArrayList<>();
        for (Category c : categoryRepository.findByUserIdOrderByNameAsc(userId)) {
            options.add(toOption(c));
        }
        return options;
    }

    @Transactional
    public Map<String, List<CategoryOption>> grouped(UUID userId) {
        List<CategoryOption> options = new ArrayList<>(options(userId));
        options.sort((a, b) -> {
            int byGroup = groupKey(a.groupName()).compareToIgnoreCase(groupKey(b.groupName()));
            return byGroup != 0 ? byGroup : a.name().compareToIgnoreCase(b.name());
        });
        Map<String, List<CategoryOption>> grouped = new LinkedHashMap<>();
        for (CategoryOption option : options) {
            String group = option.groupName() == null ? "Others" : option.groupName();
            grouped.computeIfAbsent(group, key -> new ArrayList<>()).add(option);
        }
        return grouped;
    }

    @Transactional
    public List<CategoryRow> rows(UUID userId) {
        List<CategoryOption> options = options(userId);
        Map<Long, Long> counts = new HashMap<>();
        for (Object[] row : itemRepository.countPerCategory(userId)) {
            counts.put((Long) row[0], (Long) row[1]);
        }
        List<CategoryRow> rows = new ArrayList<>();
        for (CategoryOption option : options) {
            rows.add(new CategoryRow(option, counts.getOrDefault(option.id(), 0L)));
        }
        return rows;
    }

    @Transactional(readOnly = true)
    public List<String> groups(UUID userId) {
        TreeSet<String> groups = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        for (Category c : categoryRepository.findByUserIdOrderByNameAsc(userId)) {
            if (c.getGroupName() != null && !c.getGroupName().isBlank()) {
                groups.add(c.getGroupName());
            }
        }
        return new ArrayList<>(groups);
    }

    @Transactional
    public void create(UUID userId, String name, String groupName, Integer amount, String unit, boolean manual) {
        String trimmed = requireName(name);
        if (categoryRepository.existsByUserIdAndNameIgnoreCase(userId, trimmed)) {
            throw new IllegalArgumentException("You already have a category named " + trimmed);
        }
        categoryRepository.save(new Category(userId, trimmed, cleanGroup(groupName), toDays(amount, unit, manual)));
    }

    @Transactional
    public void update(UUID userId, Long id, String name, String groupName, Integer amount, String unit,
                       boolean manual) {
        Category category = find(userId, id);
        String trimmed = requireName(name);
        if (!category.getName().equalsIgnoreCase(trimmed)
                && categoryRepository.existsByUserIdAndNameIgnoreCase(userId, trimmed)) {
            throw new IllegalArgumentException("You already have a category named " + trimmed);
        }
        category.setName(trimmed);
        category.setGroupName(cleanGroup(groupName));
        category.setShelfLifeDays(toDays(amount, unit, manual));
    }

    @Transactional
    public String delete(UUID userId, Long id) {
        Category category = find(userId, id);
        long inUse = itemRepository.countByCategory(category);
        if (inUse > 0) {
            throw new IllegalArgumentException("Move or delete the " + inUse + (inUse == 1 ? " item" : " items")
                    + " in " + category.getName() + " first");
        }
        categoryRepository.delete(category);
        return category.getName();
    }

    static Integer toDays(Integer amount, String unit, boolean manual) {
        if (manual) {
            return null;
        }
        if (amount == null || amount < 1) {
            throw new IllegalArgumentException("Enter a shelf life of at least 1, or choose no set shelf life");
        }
        return amount * Views.unitDays(unit);
    }

    private void ensureDefaults(UUID userId) {
        if (categoryRepository.countByUserId(userId) > 0) {
            return;
        }
        List<Category> copies = new ArrayList<>();
        for (Category template : categoryRepository.findByUserIdIsNullOrderByNameAsc()) {
            copies.add(new Category(userId, template.getName(), template.getGroupName(), template.getShelfLifeDays()));
        }
        categoryRepository.saveAll(copies);
    }

    private static String groupKey(String group) {
        return group == null || group.equalsIgnoreCase("Others") ? "~" : group;
    }

    private Category find(UUID userId, Long id) {
        return categoryRepository.findByIdAndUserId(id, userId).orElseThrow();
    }

    private static CategoryOption toOption(Category c) {
        return new CategoryOption(c.getId(), c.getName(), c.getGroupName(), c.getShelfLifeDays());
    }

    private static String requireName(String name) {
        String trimmed = name == null ? "" : name.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("Category name is required");
        }
        return trimmed;
    }

    private static String cleanGroup(String groupName) {
        String trimmed = groupName == null ? "" : groupName.trim();
        return trimmed.isEmpty() ? "Others" : trimmed;
    }
}
