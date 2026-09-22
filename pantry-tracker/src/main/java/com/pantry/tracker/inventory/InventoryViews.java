package com.pantry.tracker.inventory;

import java.time.LocalDate;
import java.util.List;

public final class InventoryViews {

    private InventoryViews() {
    }

    public record LocationGroupView(Long id, String name, long itemCount) {
    }

    public record BatchView(Long id, int quantity, LocalDate expirationDate, LocalDate dateAdded) {
    }

    public record ItemView(Long id, String name, String categoryName, int totalQuantity,
                           List<BatchView> batches) {
    }

    public record DuplicatePrompt(ItemView existing, String name, Long categoryId, int quantity,
                                  String expirationDate) {
    }

    public record GroupWithItems(LocationGroupView group, List<ItemView> items) {
    }
}
