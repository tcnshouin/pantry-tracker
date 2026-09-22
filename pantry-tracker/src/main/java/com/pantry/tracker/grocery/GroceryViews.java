package com.pantry.tracker.grocery;

import java.util.List;

public final class GroceryViews {

    private GroceryViews() {
    }

    public record GroceryRow(Long id, String itemName, int quantityNeeded, boolean purchased,
                             boolean linked, Long itemId) {
    }

    public record GroceryList(List<GroceryRow> suggested, List<GroceryRow> manual) {
    }

    public record RestockInfo(Long itemId, int quantity) {
    }
}
