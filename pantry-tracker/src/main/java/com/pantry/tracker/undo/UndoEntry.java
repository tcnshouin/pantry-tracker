package com.pantry.tracker.undo;

import com.pantry.tracker.undo.Snapshots.BatchSnapshot;
import com.pantry.tracker.undo.Snapshots.ItemSnapshot;
import java.time.LocalDate;

public sealed interface UndoEntry {

    String label();

    record DeleteItem(Long itemId, String label) implements UndoEntry {
    }

    record RecreateItem(ItemSnapshot snapshot, String label) implements UndoEntry {
    }

    record RestoreItemFields(Long itemId, String name, Long categoryId, boolean lowStockEnabled,
                             Integer lowStockThreshold, String label) implements UndoEntry {
    }

    record DeleteBatch(Long batchId, String label) implements UndoEntry {
    }

    record RecreateBatch(Long itemId, BatchSnapshot snapshot, String label) implements UndoEntry {
    }

    record RestoreBatchFields(Long batchId, int quantity, LocalDate expirationDate, LocalDate dateAdded,
                              boolean autoExpiry, String label) implements UndoEntry {
    }
}
