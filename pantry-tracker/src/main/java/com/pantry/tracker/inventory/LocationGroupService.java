package com.pantry.tracker.inventory;

import com.pantry.tracker.inventory.InventoryExceptions.DuplicateGroupNameException;
import com.pantry.tracker.inventory.InventoryExceptions.GroupNotEmptyException;
import com.pantry.tracker.inventory.InventoryExceptions.ResourceNotFoundException;
import com.pantry.tracker.inventory.InventoryViews.GroupWithItems;
import com.pantry.tracker.inventory.InventoryViews.ItemView;
import com.pantry.tracker.inventory.InventoryViews.LocationGroupView;
import com.pantry.tracker.user.User;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LocationGroupService {

    private final LocationGroupRepository groupRepository;
    private final ItemRepository itemRepository;
    private final InventoryStatusCalculator statusCalculator;

    public LocationGroupService(LocationGroupRepository groupRepository, ItemRepository itemRepository,
                                InventoryStatusCalculator statusCalculator) {
        this.groupRepository = groupRepository;
        this.itemRepository = itemRepository;
        this.statusCalculator = statusCalculator;
    }

    @Transactional(readOnly = true)
    public List<LocationGroupView> listGroups(User user) {
        return groupRepository.findByUserOrderByNameAsc(user).stream()
                .map(group -> new LocationGroupView(group.getId(), group.getName(),
                        itemRepository.countByLocationGroup(group)))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<GroupWithItems> listGroupsWithItems(User user) {
        LocalDate today = LocalDate.now();
        return groupRepository.findByUserOrderByNameAsc(user).stream()
                .map(group -> {
                    List<ItemView> items = itemRepository.findByLocationGroupOrderByNameAsc(group)
                            .stream().map(item -> ItemService.toView(item, statusCalculator, today)).toList();
                    return new GroupWithItems(
                            new LocationGroupView(group.getId(), group.getName(), items.size()),
                            items);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public LocationGroup require(User user, Long id) {
        return groupRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Group"));
    }

    @Transactional
    public LocationGroup create(User user, String name) {
        String trimmed = name == null ? "" : name.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("Group name is required");
        }
        if (groupRepository.existsByUserAndNameIgnoreCase(user, trimmed)) {
            throw new DuplicateGroupNameException(trimmed);
        }
        return groupRepository.save(new LocationGroup(user, trimmed));
    }

    @Transactional
    public LocationGroup rename(User user, Long id, String name) {
        String trimmed = name == null ? "" : name.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("Group name is required");
        }
        LocationGroup group = require(user, id);
        if (!group.getName().equalsIgnoreCase(trimmed)
                && groupRepository.existsByUserAndNameIgnoreCase(user, trimmed)) {
            throw new DuplicateGroupNameException(trimmed);
        }
        group.setName(trimmed);
        return group;
    }

    @Transactional
    public void delete(User user, Long id) {
        LocationGroup group = require(user, id);
        if (itemRepository.countByLocationGroup(group) > 0) {
            throw new GroupNotEmptyException();
        }
        groupRepository.delete(group);
    }
}
