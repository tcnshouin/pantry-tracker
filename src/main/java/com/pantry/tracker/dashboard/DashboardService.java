package com.pantry.tracker.dashboard;

import com.pantry.tracker.dashboard.DashboardViews.Counts;
import com.pantry.tracker.dashboard.DashboardViews.DashboardView;
import com.pantry.tracker.dashboard.DashboardViews.ExpiringEntry;
import com.pantry.tracker.dashboard.DashboardViews.LocationCount;
import com.pantry.tracker.grocery.GroceryListItemRepository;
import com.pantry.tracker.inventory.Batch;
import com.pantry.tracker.inventory.ExpiringSoonHeap;
import com.pantry.tracker.inventory.FreshnessStatus;
import com.pantry.tracker.inventory.InventoryStatusCalculator;
import com.pantry.tracker.inventory.Item;
import com.pantry.tracker.inventory.ItemRepository;
import com.pantry.tracker.inventory.StockStatus;
import com.pantry.tracker.user.User;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private static final int EXPIRING_SOON_LIMIT = 8;

    private final ItemRepository itemRepository;
    private final GroceryListItemRepository groceryRepository;
    private final InventoryStatusCalculator statusCalculator;

    public DashboardService(ItemRepository itemRepository, GroceryListItemRepository groceryRepository,
                            InventoryStatusCalculator statusCalculator) {
        this.itemRepository = itemRepository;
        this.groceryRepository = groceryRepository;
        this.statusCalculator = statusCalculator;
    }

    @Transactional(readOnly = true)
    public DashboardView build(User user, LocalDate today) {
        List<Item> items = itemRepository.findByUser(user);

        long lowStock = 0;
        long expiringThisWeek = 0;
        Map<String, Long> byLocation = new TreeMap<>();
        ExpiringSoonHeap<ExpiringEntry> heap = new ExpiringSoonHeap<>(ExpiringEntry::expirationDate);

        for (Item item : items) {
            StockStatus stock = statusCalculator.stockStatus(item);
            if (stock == StockStatus.LOW_STOCK || stock == StockStatus.OUT_OF_STOCK) {
                lowStock++;
            }
            byLocation.merge(item.getLocationGroup().getName(), 1L, Long::sum);
            for (Batch batch : item.getBatches()) {
                if (batch.getQuantity() <= 0 || batch.getExpirationDate() == null) {
                    continue;
                }
                FreshnessStatus freshness = statusCalculator.batchFreshness(batch.getExpirationDate(), today);
                if (freshness == FreshnessStatus.EXPIRING_SOON) {
                    expiringThisWeek++;
                }
                if (freshness == FreshnessStatus.EXPIRING_SOON || freshness == FreshnessStatus.EXPIRED) {
                    heap.add(new ExpiringEntry(item.getName(), item.getLocationGroup().getName(),
                            batch.getExpirationDate(), batch.getQuantity(),
                            freshness.label(), freshness.cssClass()));
                }
            }
        }

        List<LocationCount> locations = byLocation.entrySet().stream()
                .map(e -> new LocationCount(e.getKey(), e.getValue()))
                .toList();
        Counts counts = new Counts(items.size(), expiringThisWeek, lowStock,
                groceryRepository.countByUserAndPurchasedFalse(user));
        return new DashboardView(counts, locations, heap.topN(EXPIRING_SOON_LIMIT));
    }
}
