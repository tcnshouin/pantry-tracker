package com.pantry.tracker.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pantry.tracker.model.Batch;
import com.pantry.tracker.model.Item;
import com.pantry.tracker.model.LocationGroup;
import com.pantry.tracker.model.User;
import com.pantry.tracker.model.Views;
import com.pantry.tracker.model.Views.FreshnessStatus;
import com.pantry.tracker.model.Views.StockStatus;
import com.pantry.tracker.repository.BatchRepository;
import com.pantry.tracker.repository.CategoryRepository;
import com.pantry.tracker.repository.GroceryListItemRepository;
import com.pantry.tracker.repository.ItemRepository;
import com.pantry.tracker.repository.LocationGroupRepository;
import com.pantry.tracker.service.DataStructures.UndoStack;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private BatchRepository batchRepository;

    @Mock
    private LocationGroupRepository groupRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private GroceryListItemRepository groceryRepository;

    @InjectMocks
    private InventoryService service;

    private final User user = new User("owner@example.com", "hash");
    private final LocalDate today = LocalDate.of(2026, 6, 1);

    private Item itemWith(int... quantities) {
        Item item = new Item();
        item.setBatches(new ArrayList<>());
        for (int q : quantities) {
            Batch batch = new Batch();
            batch.setItem(item);
            batch.setQuantity(q);
            item.getBatches().add(batch);
        }
        return item;
    }

    @Test
    void batchFreshnessBoundaries() {
        assertThat(InventoryService.batchFreshness(today.minusDays(1), today, 7)).isEqualTo(FreshnessStatus.EXPIRED);
        assertThat(InventoryService.batchFreshness(today.plusDays(7), today, 7)).isEqualTo(FreshnessStatus.EXPIRING_SOON);
        assertThat(InventoryService.batchFreshness(today.plusDays(8), today, 7)).isEqualTo(FreshnessStatus.FRESH);
        assertThat(InventoryService.batchFreshness(null, today, 7)).isEqualTo(FreshnessStatus.NONE);
    }

    @Test
    void itemFreshnessUsesEarliestBatchThatStillHasStock() {
        Item item = itemWith(0, 2, 1);
        item.getBatches().get(0).setExpirationDate(today.minusDays(5));
        item.getBatches().get(1).setExpirationDate(today.plusDays(30));
        item.getBatches().get(2).setExpirationDate(today.plusDays(3));

        assertThat(InventoryService.itemFreshness(item, today, 7)).isEqualTo(FreshnessStatus.EXPIRING_SOON);
    }

    @Test
    void daysUntilExpiryUsesEarliestStockedBatch() {
        Item item = itemWith(0, 2, 1);
        item.getBatches().get(0).setExpirationDate(today.minusDays(5));
        item.getBatches().get(1).setExpirationDate(today.plusDays(30));
        item.getBatches().get(2).setExpirationDate(today.plusDays(3));

        assertThat(InventoryService.daysUntil(InventoryService.earliestExpiry(item), today)).isEqualTo(3);
        assertThat(InventoryService.daysUntil(null, today)).isNull();
    }

    @Test
    void expiryTextWording() {
        assertThat(Views.expiryText(null)).isNull();
        assertThat(Views.expiryText(-3)).isEqualTo("Expired 3 days ago");
        assertThat(Views.expiryText(-1)).isEqualTo("Expired yesterday");
        assertThat(Views.expiryText(0)).isEqualTo("Expires today");
        assertThat(Views.expiryText(1)).isEqualTo("Expires tomorrow");
        assertThat(Views.expiryText(12)).isEqualTo("Expiring in 12 days");
    }

    @Test
    void stockStatusFollowsTotalsAndThreshold() {
        assertThat(InventoryService.stockStatus(itemWith(0))).isEqualTo(StockStatus.OUT_OF_STOCK);

        Item low = itemWith(2);
        low.setLowStockEnabled(true);
        low.setLowStockThreshold(2);
        assertThat(InventoryService.stockStatus(low)).isEqualTo(StockStatus.LOW_STOCK);

        Item plenty = itemWith(5);
        plenty.setLowStockEnabled(true);
        plenty.setLowStockThreshold(2);
        assertThat(InventoryService.stockStatus(plenty)).isEqualTo(StockStatus.IN_STOCK);

        assertThat(InventoryService.stockStatus(itemWith(1))).isEqualTo(StockStatus.IN_STOCK);
    }

    @Test
    void createGroupRejectsDuplicateNameAndTrimsNewOnes() {
        when(groupRepository.existsByUserAndNameIgnoreCase(user, "Pantry")).thenReturn(true);
        assertThatThrownBy(() -> service.createGroup(user, "  Pantry ")).isInstanceOf(IllegalArgumentException.class);

        when(groupRepository.existsByUserAndNameIgnoreCase(user, "Shelf")).thenReturn(false);
        when(groupRepository.save(any(LocationGroup.class))).thenAnswer(inv -> inv.getArgument(0));
        assertThat(service.createGroup(user, "  Shelf ").getName()).isEqualTo("Shelf");
    }

    @Test
    void deleteGroupIsBlockedWhileItHasItems() {
        LocationGroup group = new LocationGroup(user, "Pantry");
        when(groupRepository.findByIdAndUser(7L, user)).thenReturn(Optional.of(group));
        when(itemRepository.countByLocationGroup(group)).thenReturn(2L);

        assertThatThrownBy(() -> service.deleteGroup(user, 7L)).isInstanceOf(IllegalArgumentException.class);
        verify(groupRepository, never()).delete(any());
    }

    @Test
    void quantityStepperStopsAtZeroAndCanBeUndone() {
        LocationGroup group = new LocationGroup(user, "Pantry");
        group.setId(1L);
        Item item = itemWith(1);
        item.setName("Rice");
        item.setLocationGroup(group);
        Batch batch = item.getBatches().get(0);
        when(batchRepository.findByIdAndItemUser(5L, user)).thenReturn(Optional.of(batch));
        UndoStack undo = new UndoStack();

        service.adjustQuantity(user, 5L, -5, undo);

        assertThat(batch.getQuantity()).isZero();
        assertThat(batch.getEmptySince()).isNotNull();
        assertThat(item.getEmptySince()).isNotNull();
        assertThat(undo.peekLabel()).isEqualTo("Change quantity in \"Rice\"");
    }
}
