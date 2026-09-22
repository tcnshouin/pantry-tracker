package com.pantry.tracker.inventory;

import java.time.LocalDate;
import java.util.List;

public final class BatchSorter {

    private BatchSorter() {
    }

    public static void insertSorted(List<Batch> batches, Batch incoming) {
        int i = batches.size() - 1;
        batches.add(incoming);
        while (i >= 0 && shouldComeBefore(incoming, batches.get(i))) {
            batches.set(i + 1, batches.get(i));
            i--;
        }
        batches.set(i + 1, incoming);
    }

    private static boolean shouldComeBefore(Batch incoming, Batch existing) {
        LocalDate a = incoming.getExpirationDate();
        LocalDate b = existing.getExpirationDate();
        if (a == null) {
            return false;
        }
        if (b == null) {
            return true;
        }
        return a.isBefore(b);
    }
}
