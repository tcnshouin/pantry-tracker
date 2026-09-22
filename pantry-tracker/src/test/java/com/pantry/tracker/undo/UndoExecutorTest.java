package com.pantry.tracker.undo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pantry.tracker.category.CategoryRepository;
import com.pantry.tracker.inventory.Batch;
import com.pantry.tracker.inventory.BatchRepository;
import com.pantry.tracker.inventory.Item;
import com.pantry.tracker.inventory.ItemRepository;
import com.pantry.tracker.inventory.LocationGroupRepository;
import com.pantry.tracker.user.User;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class UndoExecutorTest {

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private BatchRepository batchRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private LocationGroupRepository groupRepository;

    @InjectMocks
    private UndoExecutor executor;

    private final User user = new User("owner@example.com", "hash");

    @Test
    void restoreBatchFieldsWritesBackSavedValues() {
        Batch batch = new Batch(new Item(), 1, LocalDate.of(2026, 1, 1));
        when(batchRepository.findByIdAndItemUser(5L, user)).thenReturn(Optional.of(batch));

        executor.apply(user, new UndoEntry.RestoreBatchFields(5L, 9, LocalDate.of(2026, 5, 5),
                LocalDate.of(2026, 2, 2), true, "Edit"));

        assertThat(batch.getQuantity()).isEqualTo(9);
        assertThat(batch.getExpirationDate()).isEqualTo(LocalDate.of(2026, 5, 5));
        assertThat(batch.isAutoExpiry()).isTrue();
    }

    @Test
    void deleteItemDeletesTheOwnedItem() {
        Item item = new Item();
        when(itemRepository.findByIdAndUser(7L, user)).thenReturn(Optional.of(item));

        executor.apply(user, new UndoEntry.DeleteItem(7L, "Add item"));

        verify(itemRepository).delete(item);
    }
}
