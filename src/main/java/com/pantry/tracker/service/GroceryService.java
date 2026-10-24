package com.pantry.tracker.service;

import com.pantry.tracker.model.Batch;
import com.pantry.tracker.model.GroceryListItem;
import com.pantry.tracker.model.GroceryListItem.Source;
import com.pantry.tracker.model.Item;
import com.pantry.tracker.model.Views.GroceryPage;
import com.pantry.tracker.model.Views.GroceryRow;
import com.pantry.tracker.model.Views.GrocerySummary;
import com.pantry.tracker.model.Views.PutAwayEntry;
import com.pantry.tracker.model.Views.QuickAddOption;
import com.pantry.tracker.model.Views.StockStatus;
import com.pantry.tracker.repository.BatchRepository;
import com.pantry.tracker.repository.GroceryListItemRepository;
import com.pantry.tracker.repository.ItemRepository;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GroceryService {

    private final GroceryListItemRepository groceryRepository;
    private final ItemRepository itemRepository;
    private final BatchRepository batchRepository;
    private final InventoryService inventoryService;

    public GroceryService(GroceryListItemRepository groceryRepository, ItemRepository itemRepository,
                          BatchRepository batchRepository, InventoryService inventoryService) {
        this.groceryRepository = groceryRepository;
        this.itemRepository = itemRepository;
        this.batchRepository = batchRepository;
        this.inventoryService = inventoryService;
    }

    @Transactional
    public void syncAutoSuggestions(UUID userId) {
        for (Item item : itemRepository.findByUserId(userId)) {
            boolean needy = InventoryService.stockStatus(item) != StockStatus.IN_STOCK;
            if (needy && !item.isLowStockSuggested()) {
                int quantity = item.getLowStockThreshold() != null && item.getLowStockThreshold() > 0
                        ? item.getLowStockThreshold() : 1;
                groceryRepository.save(new GroceryListItem(userId, item, item.getName(), quantity, Source.AUTO));
                item.setLowStockSuggested(true);
            } else if (!needy && item.isLowStockSuggested()) {
                item.setLowStockSuggested(false);
            }
        }
    }

    @Transactional(readOnly = true)
    public GroceryPage page(UUID userId) {
        List<GroceryRow> rows = new ArrayList<>();
        Set<Long> onList = new HashSet<>();
        int units = 0;
        int suggested = 0;
        for (GroceryListItem e : groceryRepository.findByUserIdOrderByCreatedAtDesc(userId)) {
            Item item = e.getItem();
            boolean auto = e.getSource() == Source.AUTO;
            rows.add(new GroceryRow(e.getId(), e.getItemName(),
                    item != null ? item.getCategory().getName() : null, e.getQuantityNeeded(), auto,
                    item != null ? item.getId() : null));
            if (item != null) {
                onList.add(item.getId());
            }
            units += e.getQuantityNeeded();
            if (auto) {
                suggested++;
            }
        }
        GrocerySummary summary = new GrocerySummary(rows.size(), units, suggested, rows.size() - suggested);
        return new GroceryPage(rows, summary, quickAddOptions(userId, onList), recentlyStocked(userId));
    }

    @Transactional
    public void addManual(UUID userId, Long itemId, int quantity) {
        Item item = itemRepository.findByIdAndUserId(itemId, userId).orElseThrow();
        int amount = InputLimits.quantity(Math.max(1, quantity), 1);
        for (GroceryListItem e : groceryRepository.findByUserIdOrderByCreatedAtDesc(userId)) {
            if (e.getItem() != null && e.getItem().getId().equals(itemId)) {
                e.setQuantityNeeded(InputLimits.total(e.getQuantityNeeded() + amount));
                return;
            }
        }
        groceryRepository.save(new GroceryListItem(userId, item, item.getName(), amount, Source.MANUAL));
    }

    @Transactional
    public void changeQuantity(UUID userId, Long id, int delta) {
        GroceryListItem entry = find(userId, id);
        entry.setQuantityNeeded(Math.max(1, InputLimits.total(entry.getQuantityNeeded() + delta)));
    }

    @Transactional
    public void remove(UUID userId, Long id) {
        GroceryListItem entry = find(userId, id);
        rearm(entry);
        groceryRepository.delete(entry);
    }

    public record PutAwayResult(int putAway, int needDate) {
    }

    @Transactional
    public PutAwayResult putAway(UUID userId, List<Long> ids) {
        int count = 0;
        int needDate = 0;
        for (GroceryListItem entry : groceryRepository.findByUserIdAndIdIn(userId, ids)) {
            if (entry.getItem() == null) {
                continue;
            }
            if (entry.getItem().getCategory().getShelfLifeDays() == null) {
                needDate++;
                continue;
            }
            inventoryService.addBatch(userId, entry.getItem().getId(), entry.getQuantityNeeded(), null, true, null);
            rearm(entry);
            groceryRepository.delete(entry);
            count++;
        }
        return new PutAwayResult(count, needDate);
    }

    private List<QuickAddOption> quickAddOptions(UUID userId, Set<Long> onList) {
        List<QuickAddOption> options = new ArrayList<>();
        for (Item item : itemRepository.findByUserId(userId)) {
            if (!onList.contains(item.getId())) {
                options.add(new QuickAddOption(item.getId(), item.getName(), item.getLocationGroup().getName(),
                        item.totalQuantity()));
            }
        }
        options.sort(Comparator.comparing(o -> o.name().toLowerCase()));
        return options;
    }

    private List<PutAwayEntry> recentlyStocked(UUID userId) {
        List<PutAwayEntry> entries = new ArrayList<>();
        for (Batch batch : batchRepository.findTop8ByItemUserIdOrderByIdDesc(userId)) {
            entries.add(new PutAwayEntry(batch.getItem().getName(), batch.getQuantity(), batch.getDateAdded(),
                    batch.getItem().getLocationGroup().getName()));
        }
        return entries;
    }

    private void rearm(GroceryListItem entry) {
        if (entry.getSource() == Source.AUTO && entry.getItem() != null) {
            entry.getItem().setLowStockSuggested(false);
        }
    }

    private GroceryListItem find(UUID userId, Long id) {
        return groceryRepository.findByIdAndUserId(id, userId).orElseThrow();
    }
}
