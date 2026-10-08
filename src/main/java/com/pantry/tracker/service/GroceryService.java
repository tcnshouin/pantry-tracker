package com.pantry.tracker.service;

import com.pantry.tracker.model.GroceryListItem;
import com.pantry.tracker.model.GroceryListItem.Source;
import com.pantry.tracker.model.Item;
import com.pantry.tracker.model.User;
import com.pantry.tracker.model.Views.GroceryList;
import com.pantry.tracker.model.Views.GroceryRow;
import com.pantry.tracker.model.Views.StockStatus;
import com.pantry.tracker.repository.GroceryListItemRepository;
import com.pantry.tracker.repository.ItemRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GroceryService {

    private final GroceryListItemRepository groceryRepository;
    private final ItemRepository itemRepository;
    private final InventoryService inventoryService;

    public GroceryService(GroceryListItemRepository groceryRepository, ItemRepository itemRepository,
                          InventoryService inventoryService) {
        this.groceryRepository = groceryRepository;
        this.itemRepository = itemRepository;
        this.inventoryService = inventoryService;
    }

    @Transactional
    public void syncAutoSuggestions(User user) {
        for (Item item : itemRepository.findByUser(user)) {
            boolean needy = InventoryService.stockStatus(item) != StockStatus.IN_STOCK;
            if (needy && !item.isLowStockSuggested()) {
                int quantity = item.getLowStockThreshold() != null && item.getLowStockThreshold() > 0
                        ? item.getLowStockThreshold() : 1;
                groceryRepository.save(new GroceryListItem(user, item, item.getName(), quantity, Source.AUTO));
                item.setLowStockSuggested(true);
            } else if (!needy && item.isLowStockSuggested()) {
                item.setLowStockSuggested(false);
            }
        }
    }

    @Transactional(readOnly = true)
    public GroceryList list(User user) {
        return new GroceryList(rows(user, Source.AUTO), rows(user, Source.MANUAL));
    }

    @Transactional
    public void addManual(User user, Long itemId, int quantity) {
        Item item = itemRepository.findByIdAndUser(itemId, user).orElseThrow();
        groceryRepository.save(new GroceryListItem(user, item, item.getName(), Math.max(1, quantity), Source.MANUAL));
    }

    @Transactional
    public void togglePurchased(User user, Long id) {
        GroceryListItem entry = find(user, id);
        entry.setPurchased(!entry.isPurchased());
        if (entry.isPurchased()) {
            rearm(entry);
        }
    }

    @Transactional
    public void remove(User user, Long id) {
        GroceryListItem entry = find(user, id);
        rearm(entry);
        groceryRepository.delete(entry);
    }

    @Transactional
    public void restock(User user, Long id) {
        GroceryListItem entry = find(user, id);
        if (entry.getItem() != null) {
            inventoryService.addBatch(user, entry.getItem().getId(), entry.getQuantityNeeded(), null, true, null);
        }
        rearm(entry);
        groceryRepository.delete(entry);
    }

    private void rearm(GroceryListItem entry) {
        if (entry.getSource() == Source.AUTO && entry.getItem() != null) {
            entry.getItem().setLowStockSuggested(false);
        }
    }

    private GroceryListItem find(User user, Long id) {
        return groceryRepository.findByIdAndUser(id, user).orElseThrow();
    }

    private List<GroceryRow> rows(User user, Source source) {
        List<GroceryRow> rows = new ArrayList<>();
        for (GroceryListItem e : groceryRepository.findByUserAndSourceOrderByCreatedAtDesc(user, source)) {
            Long itemId = e.getItem() != null ? e.getItem().getId() : null;
            rows.add(new GroceryRow(e.getId(), e.getItemName(), e.getQuantityNeeded(), e.isPurchased(),
                    itemId != null, itemId));
        }
        return rows;
    }
}
