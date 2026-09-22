package com.pantry.tracker.inventory;

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
