package com.pantry.tracker.undo;

import com.pantry.tracker.category.Category;
import com.pantry.tracker.category.CategoryRepository;
import com.pantry.tracker.inventory.Batch;
import com.pantry.tracker.inventory.Item;
import com.pantry.tracker.inventory.ItemRepository;
import com.pantry.tracker.inventory.LocationGroup;
import com.pantry.tracker.inventory.LocationGroupRepository;
import com.pantry.tracker.inventory.BatchRepository;
import com.pantry.tracker.undo.Snapshots.BatchSnapshot;
import com.pantry.tracker.undo.UndoEntry.DeleteBatch;
import com.pantry.tracker.undo.UndoEntry.DeleteItem;
import com.pantry.tracker.undo.UndoEntry.RecreateBatch;
import com.pantry.tracker.undo.UndoEntry.RecreateItem;
import com.pantry.tracker.undo.UndoEntry.RestoreBatchFields;
import com.pantry.tracker.undo.UndoEntry.RestoreItemFields;
import com.pantry.tracker.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UndoExecutor {

    private final ItemRepository itemRepository;
    private final BatchRepository batchRepository;
    private final CategoryRepository categoryRepository;
    private final LocationGroupRepository groupRepository;

    public UndoExecutor(ItemRepository itemRepository, BatchRepository batchRepository,
                        CategoryRepository categoryRepository, LocationGroupRepository groupRepository) {
        this.itemRepository = itemRepository;
        this.batchRepository = batchRepository;
        this.categoryRepository = categoryRepository;
        this.groupRepository = groupRepository;
    }

    @Transactional
    public void apply(User user, UndoEntry entry) {
        switch (entry) {
            case DeleteItem e -> itemRepository.findByIdAndUser(e.itemId(), user)
                    .ifPresent(itemRepository::delete);
            case RecreateItem e -> recreateItem(user, e);
            case RestoreItemFields e -> restoreItemFields(user, e);
            case DeleteBatch e -> batchRepository.findByIdAndItemUser(e.batchId(), user)
                    .ifPresent(batchRepository::delete);
            case RecreateBatch e -> recreateBatch(user, e);
            case RestoreBatchFields e -> restoreBatchFields(user, e);
        }
    }

    private void recreateItem(User user, RecreateItem e) {
        Category category = categoryRepository.findById(e.snapshot().categoryId()).orElse(null);
        LocationGroup group = groupRepository.findByIdAndUser(e.snapshot().locationGroupId(), user)
                .orElse(null);
        if (category == null || group == null) {
            return;
        }
        Item item = new Item(user, e.snapshot().name(), category, group);
        item.setLowStockEnabled(e.snapshot().lowStockEnabled());
        item.setLowStockThreshold(e.snapshot().lowStockThreshold());
        item.setPurgeOverride(e.snapshot().purgeOverride());
        for (BatchSnapshot bs : e.snapshot().batches()) {
            Batch batch = new Batch(item, bs.quantity(), bs.expirationDate());
            batch.setDateAdded(bs.dateAdded());
            batch.setAutoExpiry(bs.autoExpiry());
            batch.setPurgeOverride(bs.purgeOverride());
            item.getBatches().add(batch);
        }
        itemRepository.save(item);
    }

    private void restoreItemFields(User user, RestoreItemFields e) {
        itemRepository.findByIdAndUser(e.itemId(), user).ifPresent(item -> {
            item.setName(e.name());
            categoryRepository.findById(e.categoryId()).ifPresent(item::setCategory);
            item.setLowStockEnabled(e.lowStockEnabled());
            item.setLowStockThreshold(e.lowStockThreshold());
        });
    }

    private void recreateBatch(User user, RecreateBatch e) {
        itemRepository.findByIdAndUser(e.itemId(), user).ifPresent(item -> {
            Batch batch = new Batch(item, e.snapshot().quantity(), e.snapshot().expirationDate());
            batch.setDateAdded(e.snapshot().dateAdded());
            batch.setAutoExpiry(e.snapshot().autoExpiry());
            batch.setPurgeOverride(e.snapshot().purgeOverride());
            batchRepository.save(batch);
        });
    }

    private void restoreBatchFields(User user, RestoreBatchFields e) {
        batchRepository.findByIdAndItemUser(e.batchId(), user).ifPresent(batch -> {
            batch.setQuantity(e.quantity());
            batch.setExpirationDate(e.expirationDate());
            batch.setDateAdded(e.dateAdded());
            batch.setAutoExpiry(e.autoExpiry());
        });
    }
}
