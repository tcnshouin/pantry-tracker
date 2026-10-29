package com.pantry.tracker.service;

import com.pantry.tracker.model.CategoryBase;
import com.pantry.tracker.model.UserCategory;
import com.pantry.tracker.model.Views;
import com.pantry.tracker.model.Views.CategoryOption;
import com.pantry.tracker.model.Views.CategoryRow;
import com.pantry.tracker.repository.ItemRepository;
import com.pantry.tracker.repository.UniversalCategoryRepository;
import com.pantry.tracker.repository.UserCategoryRepository;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeSet;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoryService {

    private final UniversalCategoryRepository universalRepository;
    private final UserCategoryRepository userRepository;
    private final ItemRepository itemRepository;

    public CategoryService(UniversalCategoryRepository universalRepository, UserCategoryRepository userRepository,
                           ItemRepository itemRepository) {
        this.universalRepository = universalRepository;
        this.userRepository = userRepository;
        this.itemRepository = itemRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryOption> options(UUID userId) {
        List<CategoryOption> options = new ArrayList<>();
        for (CategoryBase c : universalRepository.findAllByOrderByNameAsc()) {
            options.add(toOption(c));
        }
        for (CategoryBase c : userRepository.findByUserIdOrderByNameAsc(userId)) {
            options.add(toOption(c));
        }
        options.sort((a, b) -> a.name().compareToIgnoreCase(b.name()));
        return options;
    }

    @Transactional(readOnly = true)
    public Optional<CategoryBase> resolve(UUID userId, Long id) {
        if (id == null) {
            return Optional.empty();
        }
        Optional<CategoryBase> universal = universalRepository.findById(id).map(c -> c);
        return universal.isPresent() ? universal : userRepository.findByIdAndUserId(id, userId).map(c -> c);
    }

    @Transactional(readOnly = true)
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

    @Transactional(readOnly = true)
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
        for (CategoryOption c : options(userId)) {
            if (c.groupName() != null && !c.groupName().isBlank()) {
                groups.add(c.groupName());
            }
        }
        return new ArrayList<>(groups);
    }

    @Transactional
    public void create(UUID userId, String name, String groupName, Integer amount, String unit, boolean manual) {
        String trimmed = requireName(name);
        requireNewName(userId, trimmed);
        userRepository.save(new UserCategory(userId, trimmed, cleanGroup(groupName), toDays(amount, unit, manual)));
    }

    @Transactional
    public void update(UUID userId, Long id, String name, String groupName, Integer amount, String unit,
                       boolean manual) {
        UserCategory category = findOwn(userId, id);
        String trimmed = requireName(name);
        if (!category.getName().equalsIgnoreCase(trimmed)) {
            requireNewName(userId, trimmed);
        }
        category.setName(trimmed);
        category.setGroupName(cleanGroup(groupName));
        category.setShelfLifeDays(toDays(amount, unit, manual));
    }

    @Transactional
    public String delete(UUID userId, Long id) {
        UserCategory category = findOwn(userId, id);
        long inUse = itemRepository.countByUserCategory(category);
        if (inUse > 0) {
            throw new IllegalArgumentException("Move or delete the " + inUse + (inUse == 1 ? " item" : " items")
                    + " in " + category.getName() + " first");
        }
        userRepository.delete(category);
        return category.getName();
    }

    static Integer toDays(Integer amount, String unit, boolean manual) {
        if (manual) {
            return null;
        }
        if (amount == null || amount < 1) {
            throw new IllegalArgumentException("Enter a shelf life of at least 1, or choose no set shelf life");
        }
        long days = (long) amount * Views.unitDays(unit);
        if (days > InputLimits.SHELF_LIFE_MAX_DAYS) {
            throw new IllegalArgumentException("Shelf life can be at most 10 years ("
                    + InputLimits.format(InputLimits.SHELF_LIFE_MAX_DAYS) + " days)");
        }
        return (int) days;
    }

    private void requireNewName(UUID userId, String name) {
        if (universalRepository.existsByNameIgnoreCase(name)) {
            throw new IllegalArgumentException(name + " is already a default category");
        }
        if (userRepository.existsByUserIdAndNameIgnoreCase(userId, name)) {
            throw new IllegalArgumentException("You already have a category named " + name);
        }
    }

    private static String groupKey(String group) {
        return group == null || group.equalsIgnoreCase("Others") ? "~" : group;
    }

    private UserCategory findOwn(UUID userId, Long id) {
        return userRepository.findByIdAndUserId(id, userId).orElseThrow(() -> new IllegalArgumentException(
                "Default categories can't be changed. Add your own category instead."));
    }

    private static CategoryOption toOption(CategoryBase c) {
        return new CategoryOption(c.getId(), c.getName(), c.getGroupName(), c.getShelfLifeDays(), c.isUniversal());
    }

    private static String requireName(String name) {
        return InputLimits.text(name, InputLimits.CATEGORY_NAME, "Category name");
    }

    private static String cleanGroup(String groupName) {
        String trimmed = InputLimits.optionalText(groupName, InputLimits.CATEGORY_GROUP, "Category group");
        return trimmed.isEmpty() ? "Others" : trimmed;
    }
}
