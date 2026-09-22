package com.pantry.tracker.grocery;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pantry.tracker.inventory.InventoryStatusCalculator;
import com.pantry.tracker.inventory.Item;
import com.pantry.tracker.inventory.ItemRepository;
import com.pantry.tracker.inventory.StockStatus;
import com.pantry.tracker.user.User;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class GroceryListServiceTest {

    @Mock
    private GroceryListItemRepository groceryRepository;

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private InventoryStatusCalculator statusCalculator;

    @InjectMocks
    private GroceryListService service;

    private final User user = new User("owner@example.com", "hash");

    private Item item(String name, boolean suggested) {
        Item item = new Item();
        item.setName(name);
        item.setLowStockSuggested(suggested);
        return item;
    }

    @Test
    void syncAddsAutoForLowItemAndSetsFlag() {
        Item low = item("Rice", false);
        when(itemRepository.findByUser(user)).thenReturn(List.of(low));
        when(statusCalculator.stockStatus(low)).thenReturn(StockStatus.LOW_STOCK);

        service.syncAutoSuggestions(user);

        verify(groceryRepository).save(any(GroceryListItem.class));
        assertThat(low.isLowStockSuggested()).isTrue();
    }

    @Test
    void syncDoesNotDuplicateWhenAlreadySuggested() {
        Item low = item("Rice", true);
        when(itemRepository.findByUser(user)).thenReturn(List.of(low));
        when(statusCalculator.stockStatus(low)).thenReturn(StockStatus.OUT_OF_STOCK);

        service.syncAutoSuggestions(user);

        verify(groceryRepository, never()).save(any());
    }

    @Test
    void syncRearmsWhenBackInStock() {
        Item ok = item("Rice", true);
        when(itemRepository.findByUser(user)).thenReturn(List.of(ok));
        when(statusCalculator.stockStatus(ok)).thenReturn(StockStatus.IN_STOCK);

        service.syncAutoSuggestions(user);

        verify(groceryRepository, never()).save(any());
        assertThat(ok.isLowStockSuggested()).isFalse();
    }

    @Test
    void togglePurchasedRearmsLinkedAutoItem() {
        Item linked = item("Rice", true);
        GroceryListItem entry = new GroceryListItem(user, linked, "Rice", 2, GrocerySource.AUTO);
        when(groceryRepository.findByIdAndUser(9L, user)).thenReturn(Optional.of(entry));

        service.togglePurchased(user, 9L);

        assertThat(entry.isPurchased()).isTrue();
        assertThat(linked.isLowStockSuggested()).isFalse();
    }
}
