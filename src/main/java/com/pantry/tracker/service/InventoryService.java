package com.pantry.tracker.service;

import com.pantry.tracker.model.Batch;
import com.pantry.tracker.model.Category;
import com.pantry.tracker.model.Item;
import com.pantry.tracker.model.LocationGroup;
import com.pantry.tracker.model.User;
import com.pantry.tracker.model.Views;
import com.pantry.tracker.model.Views.BatchView;
import com.pantry.tracker.model.Views.CategoryOption;
import com.pantry.tracker.model.Views.ExpiringEntry;
import com.pantry.tracker.model.Views.FreshnessStatus;
import com.pantry.tracker.model.Views.GroupWithItems;
import com.pantry.tracker.model.Views.ItemView;
import com.pantry.tracker.model.Views.LocationGroupView;
import com.pantry.tracker.model.Views.Overview;
import com.pantry.tracker.model.Views.StockStatus;
import com.pantry.tracker.repository.BatchRepository;
import com.pantry.tracker.repository.CategoryRepository;
import com.pantry.tracker.repository.GroceryListItemRepository;
import com.pantry.tracker.repository.ItemRepository;
import com.pantry.tracker.repository.LocationGroupRepository;
import com.pantry.tracker.service.DataStructures.DuplicateIndex;
import com.pantry.tracker.service.DataStructures.ExpiringSoonHeap;
import com.pantry.tracker.service.DataStructures.UndoAction;
import com.pantry.tracker.service.DataStructures.UndoStack;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryService {

    private static final int ITEM_PURGE_DAYS = 7;
    private static final int BATCH_PURGE_DAYS = 3;
    private static final int EXPIRING_SOON_LIMIT = 8;

    private final ItemRepository itemRepository;
    private final BatchRepository batchRepository;
    private final LocationGroupRepository groupRepository;
    private final CategoryRepository categoryRepository;
    private final GroceryListItemRepository groceryRepository;

    @Value("${pantry.expiring-soon-days:7}")
    private int expiringSoonDays = 7;

    public InventoryService(ItemRepository itemRepository, BatchRepository batchRepository,
                            LocationGroupRepository groupRepository, CategoryRepository categoryRepository,
                            GroceryListItemRepository groceryRepository) {
        this.itemRepository = itemRepository;
        this.batchRepository = batchRepository;
        this.groupRepository = groupRepository;
        this.categoryRepository = categoryRepository;
        this.groceryRepository = groceryRepository;
    }

    public record PurgeResult(int itemsPurged, int batchesPurged) {
    }

    @Transactional(readOnly = true)
    public List<CategoryOption> categoryOptions() {
        List<CategoryOption> options = new ArrayList<>();
        for (Object[] row : categoryRepository.findOptionRows()) {
            options.add(new CategoryOption((Long) row[0], (String) row[1], (Integer) row[2]));
        }
        return options;
    }

    @Transactional(readOnly = true)
    public Overview overview(User user) {
        LocalDate today = LocalDate.now();
        List<Item> items = itemRepository.findByUser(user);
        long lowStock = 0;
        long expiringThisWeek = 0;
        ExpiringSoonHeap heap = new ExpiringSoonHeap();
        for (Item item : items) {
            if (stockStatus(item) != StockStatus.IN_STOCK) {
                lowStock++;
            }
            for (Batch batch : item.getBatches()) {
                if (batch.getQuantity() <= 0 || batch.getExpirationDate() == null) {
                    continue;
                }
                FreshnessStatus freshness = batchFreshness(batch.getExpirationDate(), today, expiringSoonDays);
                if (freshness == FreshnessStatus.EXPIRING_SOON || freshness == FreshnessStatus.EXPIRES_TODAY) {
                    expiringThisWeek++;
                }
                if (freshness != FreshnessStatus.FRESH && freshness != FreshnessStatus.NONE) {
                    heap.add(new ExpiringEntry(item.getName(), item.getLocationGroup().getName(),
                            batch.getExpirationDate(), batch.getQuantity(),
                            Views.expiryText(daysUntil(batch.getExpirationDate(), today)), freshness.cssClass(),
                            item.getLocationGroup().getId(), item.getId()));
                }
            }
        }
        return new Overview(items.size(), expiringThisWeek, lowStock,
                groceryRepository.countByUserAndPurchasedFalse(user), heap.topN(EXPIRING_SOON_LIMIT));
    }

    @Transactional(readOnly = true)
    public List<GroupWithItems> groupsWithItems(User user) {
        List<GroupWithItems> result = new ArrayList<>();
        for (LocationGroup group : groupRepository.findByUserOrderByNameAsc(user)) {
            result.add(groupWithItems(group));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public GroupWithItems groupBody(User user, Long groupId) {
        return groupWithItems(findGroup(user, groupId));
    }

    @Transactional
    public LocationGroup createGroup(User user, String name) {
        String trimmed = requireName(name);
        if (groupRepository.existsByUserAndNameIgnoreCase(user, trimmed)) {
            throw new IllegalArgumentException("A location named " + trimmed + " already exists");
        }
        return groupRepository.save(new LocationGroup(user, trimmed));
    }

    @Transactional
    public void renameGroup(User user, Long groupId, String name) {
        String trimmed = requireName(name);
        LocationGroup group = findGroup(user, groupId);
        if (!group.getName().equalsIgnoreCase(trimmed)
                && groupRepository.existsByUserAndNameIgnoreCase(user, trimmed)) {
            throw new IllegalArgumentException("A location named " + trimmed + " already exists");
        }
        group.setName(trimmed);
    }

    @Transactional
    public void deleteGroup(User user, Long groupId) {
        LocationGroup group = findGroup(user, groupId);
        if (itemRepository.countByLocationGroup(group) > 0) {
            throw new IllegalArgumentException("Move or remove its items before deleting this location");
        }
        groupRepository.delete(group);
    }

    @Transactional(readOnly = true)
    public ItemView findDuplicate(User user, String name, Long categoryId, Long groupId) {
        Item match = new DuplicateIndex(itemRepository.findByUser(user)).find(name, categoryId, groupId);
        return match == null ? null : toView(match, LocalDate.now(), Instant.now());
    }

    @Transactional
    public void createItem(User user, Long groupId, String name, Long categoryId, int quantity,
                           LocalDate expirationDate, boolean autoExpiry, UndoStack undo) {
        LocationGroup group = findGroup(user, groupId);
        Category category = categoryRepository.findById(categoryId).orElseThrow();
        LocalDate expiry = resolveExpiry(categoryId, LocalDate.now(), expirationDate, autoExpiry);
        Item item = new Item(user, name.trim(), category, group);
        Batch batch = new Batch(item, Math.max(0, quantity), expiry);
        batch.setAutoExpiry(autoExpiry);
        DataStructures.insertSorted(item.getBatches(), batch);
        itemRepository.save(item);
        if (undo != null) {
            UndoAction action = new UndoAction(UndoAction.Type.DELETE_ITEM, "Add item \"" + item.getName() + "\"");
            action.itemId = item.getId();
            undo.push(action);
        }
    }

    @Transactional
    public Long updateItem(User user, Long itemId, String name, Long categoryId, boolean lowStockEnabled,
                           Integer lowStockThreshold, UndoStack undo) {
        Item item = findItem(user, itemId);
        Category category = categoryRepository.findById(categoryId).orElseThrow();
        if (undo != null) {
            UndoAction action = new UndoAction(UndoAction.Type.RESTORE_ITEM, "Edit item \"" + item.getName() + "\"");
            action.itemId = item.getId();
            action.name = item.getName();
            action.categoryId = item.getCategory().getId();
            action.lowStockEnabled = item.isLowStockEnabled();
            action.lowStockThreshold = item.getLowStockThreshold();
            undo.push(action);
        }
        item.setName(name.trim());
        item.setCategory(category);
        item.setLowStockEnabled(lowStockEnabled);
        item.setLowStockThreshold(lowStockEnabled ? lowStockThreshold : null);
        return item.getLocationGroup().getId();
    }

    @Transactional
    public Long keepItem(User user, Long itemId) {
        Item item = findItem(user, itemId);
        item.setPurgeOverride(true);
        return item.getLocationGroup().getId();
    }

    @Transactional
    public Long deleteItem(User user, Long itemId, UndoStack undo) {
        Item item = findItem(user, itemId);
        Long groupId = item.getLocationGroup().getId();
        if (undo != null) {
            UndoAction action = new UndoAction(UndoAction.Type.RECREATE_ITEM, "Delete item \"" + item.getName() + "\"");
            action.groupId = groupId;
            action.name = item.getName();
            action.categoryId = item.getCategory().getId();
            action.lowStockEnabled = item.isLowStockEnabled();
            action.lowStockThreshold = item.getLowStockThreshold();
            action.purgeOverride = item.isPurgeOverride();
            for (Batch batch : item.getBatches()) {
                action.batches.add(UndoAction.copyOf(batch, UndoAction.Type.RECREATE_BATCH, ""));
            }
            undo.push(action);
        }
        itemRepository.delete(item);
        return groupId;
    }

    @Transactional
    public Long addBatch(User user, Long itemId, int quantity, LocalDate expirationDate, boolean autoExpiry,
                         UndoStack undo) {
        Item item = findItem(user, itemId);
        LocalDate expiry = resolveExpiry(item.getCategory().getId(), LocalDate.now(), expirationDate, autoExpiry);
        Batch batch = new Batch(item, Math.max(0, quantity), expiry);
        batch.setAutoExpiry(autoExpiry);
        applyEmptySince(batch);
        DataStructures.insertSorted(item.getBatches(), batch);
        refreshItemEmptySince(item);
        batchRepository.save(batch);
        if (undo != null) {
            UndoAction action = new UndoAction(UndoAction.Type.DELETE_BATCH, "Add batch to \"" + item.getName() + "\"");
            action.batchId = batch.getId();
            undo.push(action);
        }
        return item.getLocationGroup().getId();
    }

    @Transactional
    public Long updateBatch(User user, Long batchId, int quantity, LocalDate expirationDate, LocalDate dateAdded,
                            boolean autoExpiry, UndoStack undo) {
        Batch batch = findBatch(user, batchId);
        LocalDate newDateAdded = dateAdded != null ? dateAdded : batch.getDateAdded();
        LocalDate expiry = resolveExpiry(batch.getItem().getCategory().getId(), newDateAdded, expirationDate,
                autoExpiry);
        rememberBatch(batch, undo, "Edit batch in \"" + batch.getItem().getName() + "\"");
        batch.setQuantity(Math.max(0, quantity));
        batch.setDateAdded(newDateAdded);
        batch.setAutoExpiry(autoExpiry);
        batch.setExpirationDate(expiry);
        applyEmptySince(batch);
        refreshItemEmptySince(batch.getItem());
        return batch.getItem().getLocationGroup().getId();
    }

    @Transactional
    public Long adjustQuantity(User user, Long batchId, int delta, UndoStack undo) {
        Batch batch = findBatch(user, batchId);
        rememberBatch(batch, undo, "Change quantity in \"" + batch.getItem().getName() + "\"");
        batch.setQuantity(Math.max(0, batch.getQuantity() + delta));
        applyEmptySince(batch);
        refreshItemEmptySince(batch.getItem());
        return batch.getItem().getLocationGroup().getId();
    }

    @Transactional
    public Long adjustItemQuantity(User user, Long itemId, int delta, UndoStack undo) {
        Item item = findItem(user, itemId);
        Batch target = delta < 0 ? soonestExpiringStocked(item) : mostRecentlyAdded(item);
        if (target == null) {
            if (delta > 0) {
                return addBatch(user, itemId, delta, null, true, undo);
            }
            return item.getLocationGroup().getId();
        }
        return adjustQuantity(user, target.getId(), delta, undo);
    }

    static Batch soonestExpiringStocked(Item item) {
        Batch best = null;
        for (Batch batch : item.getBatches()) {
            if (batch.getQuantity() <= 0) {
                continue;
            }
            if (best == null || expiresBefore(batch, best)) {
                best = batch;
            }
        }
        return best;
    }

    static Batch mostRecentlyAdded(Item item) {
        Batch best = null;
        for (Batch batch : item.getBatches()) {
            if (best == null || addedAfter(batch, best)) {
                best = batch;
            }
        }
        return best;
    }

    private static boolean expiresBefore(Batch a, Batch b) {
        if (a.getExpirationDate() == null) {
            return false;
        }
        return b.getExpirationDate() == null || a.getExpirationDate().isBefore(b.getExpirationDate());
    }

    private static boolean addedAfter(Batch a, Batch b) {
        if (a.getDateAdded() != null && b.getDateAdded() != null) {
            int byDate = a.getDateAdded().compareTo(b.getDateAdded());
            if (byDate != 0) {
                return byDate > 0;
            }
        }
        return a.getId() != null && b.getId() != null && a.getId() > b.getId();
    }

    @Transactional
    public Long deleteBatch(User user, Long batchId, UndoStack undo) {
        Batch batch = findBatch(user, batchId);
        Item item = batch.getItem();
        if (undo != null) {
            undo.push(UndoAction.copyOf(batch, UndoAction.Type.RECREATE_BATCH,
                    "Delete batch in \"" + item.getName() + "\""));
        }
        item.getBatches().remove(batch);
        batchRepository.delete(batch);
        refreshItemEmptySince(item);
        return item.getLocationGroup().getId();
    }

    @Transactional
    public Long keepBatch(User user, Long batchId) {
        Batch batch = findBatch(user, batchId);
        batch.setPurgeOverride(true);
        return batch.getItem().getLocationGroup().getId();
    }

    @Transactional(readOnly = true)
    public Long groupIdOfItem(User user, Long itemId) {
        return findItem(user, itemId).getLocationGroup().getId();
    }

    @Transactional(readOnly = true)
    public Long groupIdOfBatch(User user, Long batchId) {
        return findBatch(user, batchId).getItem().getLocationGroup().getId();
    }

    @Transactional
    public void undo(User user, UndoAction action) {
        switch (action.type) {
            case DELETE_ITEM -> itemRepository.findByIdAndUser(action.itemId, user)
                    .ifPresent(itemRepository::delete);
            case RESTORE_ITEM -> itemRepository.findByIdAndUser(action.itemId, user).ifPresent(item -> {
                item.setName(action.name);
                categoryRepository.findById(action.categoryId).ifPresent(item::setCategory);
                item.setLowStockEnabled(action.lowStockEnabled);
                item.setLowStockThreshold(action.lowStockThreshold);
            });
            case RECREATE_ITEM -> recreateItem(user, action);
            case DELETE_BATCH -> batchRepository.findByIdAndItemUser(action.batchId, user)
                    .ifPresent(batchRepository::delete);
            case RESTORE_BATCH -> batchRepository.findByIdAndItemUser(action.batchId, user).ifPresent(batch -> {
                batch.setQuantity(action.quantity);
                batch.setExpirationDate(action.expirationDate);
                batch.setDateAdded(action.dateAdded);
                batch.setAutoExpiry(action.autoExpiry);
                applyEmptySince(batch);
                refreshItemEmptySince(batch.getItem());
            });
            case RECREATE_BATCH -> itemRepository.findByIdAndUser(action.itemId, user)
                    .ifPresent(item -> batchRepository.save(newBatchFrom(item, action)));
        }
    }

    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void runDailyPurge() {
        purgeSweep(Instant.now());
    }

    @Transactional
    public PurgeResult purgeSweep(Instant now) {
        int itemsPurged = 0;
        Instant itemCutoff = now.minus(Duration.ofDays(ITEM_PURGE_DAYS));
        for (Item item : itemRepository.findByPurgeOverrideFalseAndEmptySinceBefore(itemCutoff)) {
            if (item.totalQuantity() == 0) {
                itemRepository.delete(item);
                itemsPurged++;
            }
        }
        itemRepository.flush();

        int batchesPurged = 0;
        Instant batchCutoff = now.minus(Duration.ofDays(BATCH_PURGE_DAYS));
        for (Batch batch : batchRepository.findByPurgeOverrideFalseAndEmptySinceBefore(batchCutoff)) {
            if (batch.getQuantity() == 0 && !batch.getItem().isPurgeOverride()) {
                batchRepository.delete(batch);
                batchesPurged++;
            }
        }
        return new PurgeResult(itemsPurged, batchesPurged);
    }

    public static FreshnessStatus batchFreshness(LocalDate expiration, LocalDate today, int soonDays) {
        if (expiration == null) {
            return FreshnessStatus.NONE;
        }
        if (expiration.isBefore(today)) {
            return FreshnessStatus.EXPIRED;
        }
        if (expiration.isEqual(today)) {
            return FreshnessStatus.EXPIRES_TODAY;
        }
        if (!expiration.isAfter(today.plusDays(soonDays))) {
            return FreshnessStatus.EXPIRING_SOON;
        }
        return FreshnessStatus.FRESH;
    }

    public static FreshnessStatus itemFreshness(Item item, LocalDate today, int soonDays) {
        LocalDate earliest = earliestExpiry(item);
        if (earliest == null) {
            return FreshnessStatus.NONE;
        }
        return batchFreshness(earliest, today, soonDays);
    }

    public static LocalDate earliestExpiry(Item item) {
        LocalDate earliest = null;
        for (Batch batch : item.getBatches()) {
            if (batch.getQuantity() <= 0) {
                continue;
            }
            LocalDate date = batch.getExpirationDate();
            if (date != null && (earliest == null || date.isBefore(earliest))) {
                earliest = date;
            }
        }
        return earliest;
    }

    public static Integer daysUntil(LocalDate date, LocalDate today) {
        return date == null ? null : (int) ChronoUnit.DAYS.between(today, date);
    }

    public static StockStatus stockStatus(Item item) {
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
        long remaining = threshold - Duration.between(emptySince, now).toDays();
        return (int) Math.max(0, remaining);
    }

    private GroupWithItems groupWithItems(LocationGroup group) {
        LocalDate today = LocalDate.now();
        Instant now = Instant.now();
        List<ItemView> items = new ArrayList<>();
        for (Item item : itemRepository.findByLocationGroupOrderByNameAsc(group)) {
            items.add(toView(item, today, now));
        }
        return new GroupWithItems(new LocationGroupView(group.getId(), group.getName(), items.size()), items);
    }

    private ItemView toView(Item item, LocalDate today, Instant now) {
        List<BatchView> batches = new ArrayList<>();
        for (Batch b : item.getBatches()) {
            batches.add(new BatchView(b.getId(), b.getQuantity(), b.getExpirationDate(), b.getDateAdded(),
                    b.isAutoExpiry(), batchFreshness(b.getExpirationDate(), today, expiringSoonDays),
                    daysUntil(b.getExpirationDate(), today), b.isPurgeOverride(), daysUntilBatchPurge(b, now)));
        }
        return new ItemView(item.getId(), item.getName(), item.getCategory().getName(), item.totalQuantity(),
                itemFreshness(item, today, expiringSoonDays), daysUntil(earliestExpiry(item), today),
                stockStatus(item),
                item.isLowStockEnabled(), item.getLowStockThreshold(),
                item.isPurgeOverride(), daysUntilItemPurge(item, now), batches);
    }

    private void recreateItem(User user, UndoAction action) {
        LocationGroup group = groupRepository.findByIdAndUser(action.groupId, user).orElse(null);
        Category category = categoryRepository.findById(action.categoryId).orElse(null);
        if (group == null || category == null) {
            return;
        }
        Item item = new Item(user, action.name, category, group);
        item.setLowStockEnabled(action.lowStockEnabled);
        item.setLowStockThreshold(action.lowStockThreshold);
        item.setPurgeOverride(action.purgeOverride);
        for (UndoAction copy : action.batches) {
            item.getBatches().add(newBatchFrom(item, copy));
        }
        itemRepository.save(item);
    }

    private Batch newBatchFrom(Item item, UndoAction copy) {
        Batch batch = new Batch(item, copy.quantity, copy.expirationDate);
        batch.setDateAdded(copy.dateAdded);
        batch.setAutoExpiry(copy.autoExpiry);
        batch.setPurgeOverride(copy.purgeOverride);
        return batch;
    }

    private void rememberBatch(Batch batch, UndoStack undo, String label) {
        if (undo != null) {
            undo.push(UndoAction.copyOf(batch, UndoAction.Type.RESTORE_BATCH, label));
        }
    }

    private LocalDate resolveExpiry(Long categoryId, LocalDate dateAdded, LocalDate manualDate, boolean autoExpiry) {
        if (!autoExpiry) {
            return manualDate;
        }
        Integer days = categoryRepository.findShelfLifeDays(categoryId).orElseThrow(() ->
                new IllegalArgumentException("This category has no shelf-life reference; enter an expiration date manually"));
        LocalDate base = dateAdded == null ? LocalDate.now() : dateAdded;
        return base.plusDays(days);
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

    private String requireName(String name) {
        String trimmed = name == null ? "" : name.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("Group name is required");
        }
        return trimmed;
    }

    private LocationGroup findGroup(User user, Long groupId) {
        return groupRepository.findByIdAndUser(groupId, user).orElseThrow();
    }

    private Item findItem(User user, Long itemId) {
        return itemRepository.findByIdAndUser(itemId, user).orElseThrow();
    }

    private Batch findBatch(User user, Long batchId) {
        return batchRepository.findByIdAndItemUser(batchId, user).orElseThrow();
    }
}
