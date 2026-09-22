package com.pantry.tracker.inventory;

import java.time.LocalDate;
import java.util.List;

public final class InventoryViews {

    private InventoryViews() {
    }

    public record LocationGroupView(Long id, String name, long itemCount) {
    }

    public record BatchView(Long id, int quantity, LocalDate expirationDate, LocalDate dateAdded,
                            boolean autoExpiry, FreshnessStatus freshness,
                            boolean purgeOverride, Integer daysUntilPurge) {
    }

    public record ItemView(Long id, String name, String categoryName, int totalQuantity,
                           FreshnessStatus freshness, StockStatus stockStatus,
                           boolean lowStockEnabled, Integer lowStockThreshold,
                           boolean purgeOverride, Integer daysUntilPurge,
                           List<BatchView> batches) {
    }

    public record DuplicatePrompt(ItemView existing, String name, Long categoryId, int quantity,
                                  String expirationDate, boolean autoExpiry) {
    }

    public record GroupWithItems(LocationGroupView group, List<ItemView> items) {
    }
}
