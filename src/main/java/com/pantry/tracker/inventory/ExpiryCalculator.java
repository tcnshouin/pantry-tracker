package com.pantry.tracker.inventory;

import java.time.LocalDate;

public final class ExpiryCalculator {

    private ExpiryCalculator() {
    }

    public static LocalDate compute(int shelfLifeDays, LocalDate dateAdded) {
        LocalDate base = dateAdded == null ? LocalDate.now() : dateAdded;
        return base.plusDays(shelfLifeDays);
    }
}
