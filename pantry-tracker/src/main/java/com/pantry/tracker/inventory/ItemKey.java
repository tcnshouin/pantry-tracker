package com.pantry.tracker.inventory;

import java.util.Locale;

public record ItemKey(String normalizedName, Long categoryId, Long locationGroupId) {

    public static ItemKey of(String name, Long categoryId, Long locationGroupId) {
        String normalized = name == null ? "" : name.trim().toLowerCase(Locale.ROOT);
        return new ItemKey(normalized, categoryId, locationGroupId);
    }

    public static ItemKey from(Item item) {
        return of(item.getName(), item.getCategory().getId(), item.getLocationGroup().getId());
    }
}
