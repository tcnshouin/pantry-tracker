package com.pantry.tracker.inventory;

import com.pantry.tracker.category.CategoryExpiryReferenceRepository;
import com.pantry.tracker.inventory.InventoryExceptions.NoExpiryReferenceException;
import com.pantry.tracker.inventory.InventoryExceptions.ResourceNotFoundException;
import com.pantry.tracker.undo.Snapshots.BatchSnapshot;
import com.pantry.tracker.undo.UndoEntry;
import com.pantry.tracker.undo.UndoService;
import com.pantry.tracker.user.User;
import java.time.Instant;
import java.time.LocalDate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BatchService {

    private final ItemRepository itemRepository;
    private final BatchRepository batchRepository;
    private final CategoryExpiryReferenceRepository expiryReferenceRepository;
    private final UndoService undoService;

    public BatchService(ItemRepository itemRepository, BatchRepository batchRepository,
                        CategoryExpiryReferenceRepository expiryReferenceRepository,
                        UndoService undoService) {
        this.itemRepository = itemRepository;
        this.batchRepository = batchRepository;
        this.expiryReferenceRepository = expiryReferenceRepository;
        this.undoService = undoService;
    }

    @Transactional
    public Long addBatch(User user, Long itemId, int quantity, LocalDate expirationDate,
                         boolean autoExpiry) {
        Item item = itemRepository.findByIdAndUser(itemId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Item"));
        LocalDate dateAdded = LocalDate.now();
        LocalDate resolved = resolveExpiry(item, dateAdded, expirationDate, autoExpiry);
        Batch batch = new Batch(item, Math.max(0, quantity), resolved);
        batch.setAutoExpiry(autoExpiry);
        applyEmptySince(batch);
        BatchSorter.insertSorted(item.getBatches(), batch);
        refreshItemEmptySince(item);
        batchRepository.save(batch);
        undoService.push(new UndoEntry.DeleteBatch(batch.getId(),
                "Add batch to \"" + item.getName() + "\""));
        return item.getLocationGroup().getId();
    }

    @Transactional
    public Long updateBatch(User user, Long batchId, int quantity, LocalDate expirationDate,
                            LocalDate dateAdded, boolean autoExpiry) {
        Batch batch = require(user, batchId);
        recordBatchFields(batch, "Edit batch in \"" + batch.getItem().getName() + "\"");
        batch.setQuantity(Math.max(0, quantity));
        if (dateAdded != null) {
            batch.setDateAdded(dateAdded);
        }
        batch.setAutoExpiry(autoExpiry);
        batch.setExpirationDate(resolveExpiry(batch.getItem(), batch.getDateAdded(), expirationDate,
                autoExpiry));
        applyEmptySince(batch);
        refreshItemEmptySince(batch.getItem());
        return batch.getItem().getLocationGroup().getId();
    }

    private LocalDate resolveExpiry(Item item, LocalDate dateAdded, LocalDate manualDate,
                                    boolean autoExpiry) {
        if (!autoExpiry) {
            return manualDate;
        }
        Integer days = expiryReferenceRepository
                .findShelfLifeDaysByCategoryId(item.getCategory().getId())
                .orElseThrow(NoExpiryReferenceException::new);
        return ExpiryCalculator.compute(days, dateAdded);
    }

    @Transactional
    public Long adjustQuantity(User user, Long batchId, int delta) {
        Batch batch = require(user, batchId);
        recordBatchFields(batch, "Change quantity in \"" + batch.getItem().getName() + "\"");
        batch.setQuantity(Math.max(0, batch.getQuantity() + delta));
        applyEmptySince(batch);
        refreshItemEmptySince(batch.getItem());
        return batch.getItem().getLocationGroup().getId();
    }

    @Transactional
    public Long deleteBatch(User user, Long batchId) {
        Batch batch = require(user, batchId);
        Item item = batch.getItem();
        Long groupId = item.getLocationGroup().getId();
        BatchSnapshot snapshot = new BatchSnapshot(batch.getQuantity(), batch.getExpirationDate(),
                batch.getDateAdded(), batch.isAutoExpiry(), batch.isPurgeOverride());
        undoService.push(new UndoEntry.RecreateBatch(item.getId(), snapshot,
                "Delete batch in \"" + item.getName() + "\""));
        item.getBatches().remove(batch);
        batchRepository.delete(batch);
        refreshItemEmptySince(item);
        return groupId;
    }

    private void recordBatchFields(Batch batch, String label) {
        undoService.push(new UndoEntry.RestoreBatchFields(batch.getId(), batch.getQuantity(),
                batch.getExpirationDate(), batch.getDateAdded(), batch.isAutoExpiry(), label));
    }

    @Transactional
    public Long keep(User user, Long batchId) {
        Batch batch = require(user, batchId);
        batch.setPurgeOverride(true);
        return batch.getItem().getLocationGroup().getId();
    }

    @Transactional(readOnly = true)
    public Batch require(User user, Long batchId) {
        return batchRepository.findByIdAndItemUser(batchId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Batch"));
    }

    @Transactional(readOnly = true)
    public Long groupIdOfBatch(User user, Long batchId) {
        return require(user, batchId).getItem().getLocationGroup().getId();
    }

    private void applyEmptySince(Batch batch) {
        if (batch.getQuantity() == 0) {
            if (batch.getEmptySince() == null) {
                batch.setEmptySince(Instant.now());
            }
        } else {
            batch.setEmptySince(null);
        }
    }

    private void refreshItemEmptySince(Item item) {
        if (item.totalQuantity() == 0) {
            if (item.getEmptySince() == null) {
                item.setEmptySince(Instant.now());
            }
        } else {
            item.setEmptySince(null);
        }
    }
}
