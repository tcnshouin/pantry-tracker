package com.pantry.tracker.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pantry.tracker.model.Batch;
import com.pantry.tracker.model.Category;
import com.pantry.tracker.model.GroceryListItem;
import com.pantry.tracker.model.GroceryListItem.Source;
import com.pantry.tracker.model.Item;
import com.pantry.tracker.repository.BatchRepository;
import com.pantry.tracker.repository.GroceryListItemRepository;
import com.pantry.tracker.repository.ItemRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class GroceryServiceTest {

    @Mock
    private GroceryListItemRepository groceryRepository;

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private BatchRepository batchRepository;

    @Mock
    private InventoryService inventoryService;

    @InjectMocks
    private GroceryService groceryService;

    private final UUID user = UUID.randomUUID();

    private Item item(int quantity, boolean alreadySuggested) {
        Item item = new Item();
        item.setName("Rice");
        item.setLowStockEnabled(true);
        item.setLowStockThreshold(2);
        item.setLowStockSuggested(alreadySuggested);
        item.setCategory(new Category(user, "Rice", "Rice & Grains", 730));
        item.setBatches(new ArrayList<>());
        Batch batch = new Batch();
        batch.setQuantity(quantity);
        item.getBatches().add(batch);
        return item;
    }

    @Test
    void lowItemIsSuggestedOnce() {
        Item low = item(2, false);
        when(itemRepository.findByUserId(user)).thenReturn(List.of(low));

        groceryService.syncAutoSuggestions(user);

        verify(groceryRepository).save(any(GroceryListItem.class));
        assertThat(low.isLowStockSuggested()).isTrue();
    }

    @Test
    void alreadySuggestedItemIsNotAddedAgain() {
        when(itemRepository.findByUserId(user)).thenReturn(List.of(item(0, true)));

        groceryService.syncAutoSuggestions(user);

        verify(groceryRepository, never()).save(any());
    }

    @Test
    void restockedItemCanBeSuggestedAgainLater() {
        Item restocked = item(5, true);
        when(itemRepository.findByUserId(user)).thenReturn(List.of(restocked));

        groceryService.syncAutoSuggestions(user);

        assertThat(restocked.isLowStockSuggested()).isFalse();
    }

    @Test
    void quantityChangesButNeverDropsBelowOne() {
        GroceryListItem entry = new GroceryListItem(user, null, "Milk", 2, Source.MANUAL);
        when(groceryRepository.findByIdAndUserId(4L, user)).thenReturn(Optional.of(entry));

        groceryService.changeQuantity(user, 4L, 1);
        assertThat(entry.getQuantityNeeded()).isEqualTo(3);

        groceryService.changeQuantity(user, 4L, -5);
        assertThat(entry.getQuantityNeeded()).isEqualTo(1);
    }

    @Test
    void putAwayAddsBatchesWithRowQuantityAndClearsTheRows() {
        Item rice = item(0, true);
        rice.setId(11L);
        GroceryListItem suggested = new GroceryListItem(user, rice, "Rice", 3, Source.AUTO);
        GroceryListItem orphan = new GroceryListItem(user, null, "Old thing", 1, Source.MANUAL);
        when(groceryRepository.findByUserIdAndIdIn(user, List.of(1L, 2L))).thenReturn(List.of(suggested, orphan));

        GroceryService.PutAwayResult result = groceryService.putAway(user, List.of(1L, 2L));

        assertThat(result.putAway()).isEqualTo(1);
        verify(inventoryService).addBatch(eq(user), eq(11L), eq(3), isNull(), eq(true), isNull());
        verify(groceryRepository).delete(suggested);
        verify(groceryRepository, never()).delete(orphan);
        assertThat(rice.isLowStockSuggested()).isFalse();
    }

    @Test
    void putAwaySkipsItemsWhoseCategoryNeedsAManualDate() {
        Item other = item(0, false);
        other.setId(12L);
        other.setCategory(new Category(user, "Others", "Others", null));
        GroceryListItem entry = new GroceryListItem(user, other, "Mystery jar", 1, Source.MANUAL);
        when(groceryRepository.findByUserIdAndIdIn(user, List.of(3L))).thenReturn(List.of(entry));

        GroceryService.PutAwayResult result = groceryService.putAway(user, List.of(3L));

        assertThat(result.putAway()).isZero();
        assertThat(result.needDate()).isEqualTo(1);
        verify(groceryRepository, never()).delete(entry);
    }

    @Test
    void addingAnItemAlreadyOnTheListBumpsItsQuantity() {
        Item rice = item(1, false);
        rice.setId(11L);
        GroceryListItem existing = new GroceryListItem(user, rice, "Rice", 2, Source.MANUAL);
        when(itemRepository.findByIdAndUserId(11L, user)).thenReturn(Optional.of(rice));
        when(groceryRepository.findByUserIdOrderByCreatedAtDesc(user)).thenReturn(List.of(existing));

        groceryService.addManual(user, 11L, 2);

        assertThat(existing.getQuantityNeeded()).isEqualTo(4);
        verify(groceryRepository, never()).save(any());
    }
}
