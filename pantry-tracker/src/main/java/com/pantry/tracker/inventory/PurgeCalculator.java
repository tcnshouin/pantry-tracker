package com.pantry.tracker.inventory;

import java.time.Duration;
import java.time.Instant;

public final class PurgeCalculator {

    public static final int ITEM_PURGE_DAYS = 7;
    public static final int BATCH_PURGE_DAYS = 3;

    private PurgeCalculator() {
    }

    public static Integer daysUntilItemPurge(Item item, Instant now) {
        if (item.isPurgeOverride() || item.getEmptySince() == null) {
            return null;
        }
        return remainingDays(item.getEmptySince(), now, ITEM_PURGE_DAYS);
    }

    public static Integer daysUntilBatchPurge(Batch batch, Instant now) {
        if (batch.getItem().isPurgeOverride() || batch.isPurgeOverride() || batch.getEmptySince() == null) {
            return null;
        }
        return remainingDays(batch.getEmptySince(), now, BATCH_PURGE_DAYS);
    }

    private static int remainingDays(Instant emptySince, Instant now, int threshold) {
        long elapsed = Duration.between(emptySince, now).toDays();
        long remaining = threshold - elapsed;
        return (int) Math.max(0, remaining);
    }
}
