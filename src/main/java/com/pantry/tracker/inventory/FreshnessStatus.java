package com.pantry.tracker.inventory;

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
