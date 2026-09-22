package com.pantry.tracker.dashboard;

import java.time.LocalDate;
import java.util.List;

public final class DashboardViews {

    private DashboardViews() {
    }

    public record Counts(long totalItems, long expiringThisWeek, long lowStock,
                         long grocerySuggestions) {
    }

    public record LocationCount(String name, long itemCount) {
    }

    public record ExpiringEntry(String itemName, String locationName, LocalDate expirationDate,
                                int quantity, String freshnessLabel, String freshnessCssClass) {
    }

    public record DashboardView(Counts counts, List<LocationCount> byLocation,
                                List<ExpiringEntry> expiringSoon) {
    }
}
