package com.pantry.tracker.inventory;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

class BatchSorterTest {

    private Batch batch(LocalDate expiration) {
        Batch batch = new Batch();
        batch.setExpirationDate(expiration);
        return batch;
    }

    @Test
    void keepsBatchesSortedByExpirationAscending() {
        List<Batch> batches = new ArrayList<>();

        BatchSorter.insertSorted(batches, batch(LocalDate.of(2026, 1, 10)));
        BatchSorter.insertSorted(batches, batch(LocalDate.of(2026, 1, 5)));
        BatchSorter.insertSorted(batches, batch(LocalDate.of(2026, 1, 20)));
        BatchSorter.insertSorted(batches, batch(LocalDate.of(2026, 1, 1)));

        assertThat(batches).extracting(Batch::getExpirationDate).containsExactly(
                LocalDate.of(2026, 1, 1),
                LocalDate.of(2026, 1, 5),
                LocalDate.of(2026, 1, 10),
                LocalDate.of(2026, 1, 20));
    }

    @Test
    void nullExpirationSortsLast() {
        List<Batch> batches = new ArrayList<>();

        BatchSorter.insertSorted(batches, batch(null));
        BatchSorter.insertSorted(batches, batch(LocalDate.of(2026, 1, 5)));
        BatchSorter.insertSorted(batches, batch(null));
        BatchSorter.insertSorted(batches, batch(LocalDate.of(2026, 1, 1)));

        assertThat(batches).extracting(Batch::getExpirationDate).containsExactly(
                LocalDate.of(2026, 1, 1),
                LocalDate.of(2026, 1, 5),
                null,
                null);
    }
}
