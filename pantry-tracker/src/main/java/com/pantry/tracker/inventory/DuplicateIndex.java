package com.pantry.tracker.inventory;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class DuplicateIndex {

    private final Map<ItemKey, Item> index = new HashMap<>();

    public DuplicateIndex(List<Item> items) {
        for (Item item : items) {
            index.put(ItemKey.from(item), item);
        }
    }

    public Optional<Item> find(String name, Long categoryId, Long locationGroupId) {
        return Optional.ofNullable(index.get(ItemKey.of(name, categoryId, locationGroupId)));
    }
}
