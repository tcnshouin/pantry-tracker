package com.pantry.tracker.inventory;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pantry.tracker.inventory.InventoryExceptions.DuplicateGroupNameException;
import com.pantry.tracker.inventory.InventoryExceptions.GroupNotEmptyException;
import com.pantry.tracker.user.User;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class LocationGroupServiceTest {

    @Mock
    private LocationGroupRepository groupRepository;

    @Mock
    private ItemRepository itemRepository;

    @InjectMocks
    private LocationGroupService service;

    private final User user = new User("owner@example.com", "hash");

    @Test
    void createRejectsCaseInsensitiveDuplicateName() {
        when(groupRepository.existsByUserAndNameIgnoreCase(user, "Pantry")).thenReturn(true);

        assertThatThrownBy(() -> service.create(user, "  Pantry  "))
                .isInstanceOf(DuplicateGroupNameException.class);

        verify(groupRepository, never()).save(any());
    }

    @Test
    void createSavesTrimmedName() {
        when(groupRepository.existsByUserAndNameIgnoreCase(user, "Pantry")).thenReturn(false);
        when(groupRepository.save(any(LocationGroup.class))).thenAnswer(inv -> inv.getArgument(0));

        LocationGroup created = service.create(user, "  Pantry  ");

        assertThat(created.getName()).isEqualTo("Pantry");
    }

    @Test
    void deleteRejectsNonEmptyGroup() {
        LocationGroup group = new LocationGroup(user, "Pantry");
        when(groupRepository.findByIdAndUser(7L, user)).thenReturn(Optional.of(group));
        when(itemRepository.countByLocationGroup(group)).thenReturn(2L);

        assertThatThrownBy(() -> service.delete(user, 7L))
                .isInstanceOf(GroupNotEmptyException.class);

        verify(groupRepository, never()).delete(any());
    }

    @Test
    void deleteRemovesEmptyGroup() {
        LocationGroup group = new LocationGroup(user, "Pantry");
        when(groupRepository.findByIdAndUser(7L, user)).thenReturn(Optional.of(group));
        when(itemRepository.countByLocationGroup(group)).thenReturn(0L);

        service.delete(user, 7L);

        verify(groupRepository).delete(group);
    }
}
