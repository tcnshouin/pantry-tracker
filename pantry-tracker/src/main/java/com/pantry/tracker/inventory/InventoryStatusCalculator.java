package com.pantry.tracker.inventory;

import java.time.LocalDate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class InventoryStatusCalculator {

    private final int expiringSoonDays;

    public InventoryStatusCalculator(@Value("${pantry.expiring-soon-days:7}") int expiringSoonDays) {
        this.expiringSoonDays = expiringSoonDays;
    }

    public FreshnessStatus batchFreshness(LocalDate expiration, LocalDate today) {
        if (expiration == null) {
            return FreshnessStatus.NONE;
        }
        if (expiration.isBefore(today)) {
            return FreshnessStatus.EXPIRED;
        }
        if (!expiration.isAfter(today.plusDays(expiringSoonDays))) {
            return FreshnessStatus.EXPIRING_SOON;
        }
        return FreshnessStatus.FRESH;
    }

    public FreshnessStatus itemFreshness(Item item, LocalDate today) {
        LocalDate earliest = item.getBatches().stream()
                .filter(b -> b.getQuantity() > 0)
                .map(Batch::getExpirationDate)
                .filter(d -> d != null)
                .min(LocalDate::compareTo)
                .orElse(null);
        boolean hasStock = item.getBatches().stream().anyMatch(b -> b.getQuantity() > 0);
        if (!hasStock) {
            return FreshnessStatus.NONE;
        }
        return earliest == null ? FreshnessStatus.NONE : batchFreshness(earliest, today);
    }

    public StockStatus stockStatus(Item item) {
        int total = item.totalQuantity();
        if (total == 0) {
            return StockStatus.OUT_OF_STOCK;
        }
        if (item.isLowStockEnabled() && item.getLowStockThreshold() != null
                && total <= item.getLowStockThreshold()) {
            return StockStatus.LOW_STOCK;
        }
        return StockStatus.IN_STOCK;
    }
}
