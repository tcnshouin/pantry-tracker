package com.pantry.tracker.model;

import java.time.LocalDate;
import java.util.List;

public final class Views {

    private Views() {
    }

    public enum FreshnessStatus {
        EXPIRED("Expired", "pt-badge pt-badge-warning"),
        EXPIRING_SOON("Expiring soon", "pt-badge pt-badge-accent"),
        FRESH("Fresh", "pt-badge pt-badge-fresh"),
        NONE("No date", "pt-badge pt-badge-muted");

        private final String label;
        private final String cssClass;

        FreshnessStatus(String label, String cssClass) {
            this.label = label;
            this.cssClass = cssClass;
        }

        public String label() {
            return label;
        }

        public String cssClass() {
            return cssClass;
        }
    }

    public enum StockStatus {
        OUT_OF_STOCK("Out of stock", "pt-badge pt-badge-warning"),
        LOW_STOCK("Low stock", "pt-badge pt-badge-accent"),
        IN_STOCK("In stock", "pt-badge pt-badge-fresh");

        private final String label;
        private final String cssClass;

        StockStatus(String label, String cssClass) {
            this.label = label;
            this.cssClass = cssClass;
        }

        public String label() {
            return label;
        }

        public String cssClass() {
            return cssClass;
        }
    }

    public record CategoryOption(Long id, String name, Integer shelfLifeDays) {
    }

    public record LocationGroupView(Long id, String name, long itemCount) {
    }

    public static String expiryText(Integer days) {
        if (days == null) {
            return null;
        }
        if (days < -1) {
            return "Expired " + (-days) + " days ago";
        }
        if (days == -1) {
            return "Expired yesterday";
        }
        if (days == 0) {
            return "Expires today";
        }
        if (days == 1) {
            return "Expires tomorrow";
        }
        return "Expiring in " + days + " days";
    }

    public record BatchView(Long id, int quantity, LocalDate expirationDate, LocalDate dateAdded,
                            boolean autoExpiry, FreshnessStatus freshness, Integer daysUntilExpiry,
                            boolean purgeOverride, Integer daysUntilPurge) {

        public String expiryText() {
            return Views.expiryText(daysUntilExpiry);
        }
    }

    public record ItemView(Long id, String name, String categoryName, int totalQuantity,
                           FreshnessStatus freshness, Integer daysUntilExpiry, StockStatus stockStatus,
                           boolean lowStockEnabled, Integer lowStockThreshold,
                           boolean purgeOverride, Integer daysUntilPurge,
                           List<BatchView> batches) {

        public String expiryText() {
            return Views.expiryText(daysUntilExpiry);
        }
    }

    public record GroupWithItems(LocationGroupView group, List<ItemView> items) {
    }

    public record DuplicatePrompt(ItemView existing, String name, Long categoryId, int quantity,
                                  String expirationDate, boolean autoExpiry) {
    }

    public record ExpiringEntry(String itemName, String locationName, LocalDate expirationDate,
                                int quantity, String freshnessLabel, String freshnessCssClass) {
    }

    public record Overview(long totalItems, long expiringThisWeek, long lowStock, long onGroceryList,
                           List<ExpiringEntry> expiringSoon) {
    }

    public record GroceryRow(Long id, String itemName, int quantityNeeded, boolean purchased,
                             boolean linked, Long itemId) {
    }

    public record GroceryList(List<GroceryRow> suggested, List<GroceryRow> manual) {
    }
}
