package com.pantry.tracker.inventory;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.pantry.tracker.user.User;
import java.util.ArrayList;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BatchServiceTest {

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private BatchRepository batchRepository;

    @InjectMocks
    private BatchService service;

    private final User user = new User("owner@example.com", "hash");

    private Batch attachedBatch(int quantity) {
        LocationGroup group = new LocationGroup();
        group.setId(1L);
        Item item = new Item();
        item.setLocationGroup(group);
        item.setBatches(new ArrayList<>());
        Batch batch = new Batch(item, quantity, null);
        item.getBatches().add(batch);
        return batch;
    }

    @Test
    void adjustQuantityClampsAtZeroAndSetsEmptySince() {
        Batch batch = attachedBatch(1);
        when(batchRepository.findByIdAndItemUser(5L, user)).thenReturn(Optional.of(batch));

        service.adjustQuantity(user, 5L, -5);

        assertThat(batch.getQuantity()).isZero();
        assertThat(batch.getEmptySince()).isNotNull();
        assertThat(batch.getItem().getEmptySince()).isNotNull();
    }

    @Test
    void adjustQuantityClearsEmptySinceWhenRestocked() {
        Batch batch = attachedBatch(0);
        batch.setEmptySince(java.time.Instant.now());
        batch.getItem().setEmptySince(java.time.Instant.now());
        when(batchRepository.findByIdAndItemUser(5L, user)).thenReturn(Optional.of(batch));

        service.adjustQuantity(user, 5L, 3);

        assertThat(batch.getQuantity()).isEqualTo(3);
        assertThat(batch.getEmptySince()).isNull();
        assertThat(batch.getItem().getEmptySince()).isNull();
    }
}
