package com.pantry.tracker.undo;

import java.time.LocalDate;
import java.util.List;

public final class Snapshots {

    private Snapshots() {
    }

    public record BatchSnapshot(int quantity, LocalDate expirationDate, LocalDate dateAdded,
                                boolean autoExpiry, boolean purgeOverride) {
    }

    public record ItemSnapshot(String name, Long categoryId, Long locationGroupId,
                               boolean lowStockEnabled, Integer lowStockThreshold,
                               boolean purgeOverride, List<BatchSnapshot> batches) {
    }
}
