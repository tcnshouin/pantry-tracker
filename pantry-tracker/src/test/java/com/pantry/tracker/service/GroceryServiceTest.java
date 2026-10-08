package com.pantry.tracker.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pantry.tracker.model.Batch;
import com.pantry.tracker.model.GroceryListItem;
import com.pantry.tracker.model.GroceryListItem.Source;
import com.pantry.tracker.model.Item;
import com.pantry.tracker.model.User;
import com.pantry.tracker.repository.GroceryListItemRepository;
import com.pantry.tracker.repository.ItemRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
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
    private InventoryService inventoryService;

    @InjectMocks
    private GroceryService groceryService;

    private final User user = new User("owner@example.com", "hash");

    private Item item(int quantity, boolean alreadySuggested) {
        Item item = new Item();
        item.setName("Rice");
        item.setLowStockEnabled(true);
        item.setLowStockThreshold(2);
        item.setLowStockSuggested(alreadySuggested);
        item.setBatches(new ArrayList<>());
        Batch batch = new Batch();
        batch.setQuantity(quantity);
        item.getBatches().add(batch);
        return item;
    }

    @Test
    void lowItemIsSuggestedOnce() {
        Item low = item(2, false);
        when(itemRepository.findByUser(user)).thenReturn(List.of(low));

        groceryService.syncAutoSuggestions(user);

        verify(groceryRepository).save(any(GroceryListItem.class));
        assertThat(low.isLowStockSuggested()).isTrue();
    }

    @Test
    void alreadySuggestedItemIsNotAddedAgain() {
        when(itemRepository.findByUser(user)).thenReturn(List.of(item(0, true)));

        groceryService.syncAutoSuggestions(user);

        verify(groceryRepository, never()).save(any());
    }

    @Test
    void restockedItemCanBeSuggestedAgainLater() {
        Item restocked = item(5, true);
        when(itemRepository.findByUser(user)).thenReturn(List.of(restocked));

        groceryService.syncAutoSuggestions(user);

        assertThat(restocked.isLowStockSuggested()).isFalse();
    }

    @Test
    void buyingASuggestedItemAllowsItToBeSuggestedAgain() {
        Item linked = item(0, true);
        GroceryListItem entry = new GroceryListItem(user, linked, "Rice", 2, Source.AUTO);
        when(groceryRepository.findByIdAndUser(9L, user)).thenReturn(Optional.of(entry));

        groceryService.togglePurchased(user, 9L);

        assertThat(entry.isPurchased()).isTrue();
        assertThat(linked.isLowStockSuggested()).isFalse();
    }
}
