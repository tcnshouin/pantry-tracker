package com.pantry.tracker.grocery;

import com.pantry.tracker.grocery.GroceryViews.GroceryList;
import com.pantry.tracker.grocery.GroceryViews.GroceryRow;
import com.pantry.tracker.grocery.GroceryViews.RestockInfo;
import com.pantry.tracker.inventory.InventoryExceptions.ResourceNotFoundException;
import com.pantry.tracker.inventory.InventoryStatusCalculator;
import com.pantry.tracker.inventory.Item;
import com.pantry.tracker.inventory.ItemRepository;
import com.pantry.tracker.inventory.StockStatus;
import com.pantry.tracker.user.User;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GroceryListService {

    private final GroceryListItemRepository groceryRepository;
    private final ItemRepository itemRepository;
    private final InventoryStatusCalculator statusCalculator;

    public GroceryListService(GroceryListItemRepository groceryRepository, ItemRepository itemRepository,
                              InventoryStatusCalculator statusCalculator) {
        this.groceryRepository = groceryRepository;
        this.itemRepository = itemRepository;
        this.statusCalculator = statusCalculator;
    }

    @Transactional
    public void syncAutoSuggestions(User user) {
        for (Item item : itemRepository.findByUser(user)) {
            StockStatus status = statusCalculator.stockStatus(item);
            boolean needy = status == StockStatus.OUT_OF_STOCK || status == StockStatus.LOW_STOCK;
            if (needy && !item.isLowStockSuggested()) {
                groceryRepository.save(new GroceryListItem(user, item, item.getName(),
                        suggestedQuantity(item), GrocerySource.AUTO));
                item.setLowStockSuggested(true);
            } else if (!needy && item.isLowStockSuggested()) {
                item.setLowStockSuggested(false);
            }
        }
    }

    @Transactional(readOnly = true)
    public GroceryList list(User user) {
        return new GroceryList(
                rows(groceryRepository.findByUserAndSourceOrderByCreatedAtDesc(user, GrocerySource.AUTO)),
                rows(groceryRepository.findByUserAndSourceOrderByCreatedAtDesc(user, GrocerySource.MANUAL)));
    }

    @Transactional
    public void addManual(User user, Long itemId, int quantity) {
        Item item = itemRepository.findByIdAndUser(itemId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Item"));
        groceryRepository.save(new GroceryListItem(user, item, item.getName(),
                Math.max(1, quantity), GrocerySource.MANUAL));
    }

    @Transactional
    public GroceryListItem togglePurchased(User user, Long id) {
        GroceryListItem entry = require(user, id);
        entry.setPurchased(!entry.isPurchased());
        if (entry.isPurchased() && entry.getSource() == GrocerySource.AUTO && entry.getItem() != null) {
            entry.getItem().setLowStockSuggested(false);
        }
        return entry;
    }

    @Transactional
    public void remove(User user, Long id) {
        GroceryListItem entry = require(user, id);
        if (entry.getSource() == GrocerySource.AUTO && entry.getItem() != null) {
            entry.getItem().setLowStockSuggested(false);
        }
        groceryRepository.delete(entry);
    }

    @Transactional(readOnly = true)
    public GroceryListItem require(User user, Long id) {
        return groceryRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Grocery item"));
    }

    @Transactional(readOnly = true)
    public RestockInfo restockInfo(User user, Long id) {
        GroceryListItem entry = require(user, id);
        if (entry.getItem() == null) {
            throw new ResourceNotFoundException("Linked item");
        }
        return new RestockInfo(entry.getItem().getId(), entry.getQuantityNeeded());
    }

    private int suggestedQuantity(Item item) {
        Integer threshold = item.getLowStockThreshold();
        return threshold != null && threshold > 0 ? threshold : 1;
    }

    private List<GroceryRow> rows(List<GroceryListItem> entries) {
        return entries.stream()
                .map(e -> new GroceryRow(e.getId(), e.getItemName(), e.getQuantityNeeded(),
                        e.isPurchased(), e.getItem() != null,
                        e.getItem() != null ? e.getItem().getId() : null))
                .toList();
    }
}
