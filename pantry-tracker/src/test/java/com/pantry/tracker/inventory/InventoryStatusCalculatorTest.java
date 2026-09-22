package com.pantry.tracker.inventory;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

class InventoryStatusCalculatorTest {

    private final InventoryStatusCalculator calc = new InventoryStatusCalculator(7);
    private final LocalDate today = LocalDate.of(2026, 6, 1);

    private Item itemWithBatches(List<Batch> batches) {
        Item item = new Item();
        item.setBatches(new ArrayList<>(batches));
        return item;
    }

    private Batch batch(int quantity, LocalDate expiration) {
        Batch b = new Batch();
        b.setQuantity(quantity);
        b.setExpirationDate(expiration);
        return b;
    }

    @Test
    void batchFreshnessBoundaries() {
        assertThat(calc.batchFreshness(today.minusDays(1), today)).isEqualTo(FreshnessStatus.EXPIRED);
        assertThat(calc.batchFreshness(today.plusDays(3), today)).isEqualTo(FreshnessStatus.EXPIRING_SOON);
        assertThat(calc.batchFreshness(today.plusDays(7), today)).isEqualTo(FreshnessStatus.EXPIRING_SOON);
        assertThat(calc.batchFreshness(today.plusDays(8), today)).isEqualTo(FreshnessStatus.FRESH);
        assertThat(calc.batchFreshness(null, today)).isEqualTo(FreshnessStatus.NONE);
    }

    @Test
    void itemRollsUpToEarliestExpiringInStockBatch() {
        Item item = itemWithBatches(List.of(
                batch(2, today.plusDays(30)),
                batch(1, today.minusDays(1))));

        assertThat(calc.itemFreshness(item, today)).isEqualTo(FreshnessStatus.EXPIRED);
    }

    @Test
    void emptyBatchesDoNotDriveItemFreshness() {
        Item item = itemWithBatches(List.of(
                batch(0, today.minusDays(5)),
                batch(3, today.plusDays(30))));

        assertThat(calc.itemFreshness(item, today)).isEqualTo(FreshnessStatus.FRESH);
    }

    @Test
    void stockStatusReflectsTotalsAndThreshold() {
        Item out = itemWithBatches(List.of(batch(0, null)));
        assertThat(calc.stockStatus(out)).isEqualTo(StockStatus.OUT_OF_STOCK);

        Item low = itemWithBatches(List.of(batch(2, null)));
        low.setLowStockEnabled(true);
        low.setLowStockThreshold(2);
        assertThat(calc.stockStatus(low)).isEqualTo(StockStatus.LOW_STOCK);

        Item ok = itemWithBatches(List.of(batch(5, null)));
        ok.setLowStockEnabled(true);
        ok.setLowStockThreshold(2);
        assertThat(calc.stockStatus(ok)).isEqualTo(StockStatus.IN_STOCK);

        Item disabled = itemWithBatches(List.of(batch(1, null)));
        assertThat(calc.stockStatus(disabled)).isEqualTo(StockStatus.IN_STOCK);
    }
}
