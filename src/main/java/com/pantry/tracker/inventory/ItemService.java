package com.pantry.tracker.inventory;

import com.pantry.tracker.category.Category;
import com.pantry.tracker.category.CategoryRepository;
import com.pantry.tracker.inventory.InventoryExceptions.ResourceNotFoundException;
import com.pantry.tracker.inventory.InventoryViews.BatchView;
import com.pantry.tracker.inventory.InventoryViews.ItemView;
import com.pantry.tracker.user.User;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final LocationGroupRepository groupRepository;
    private final CategoryRepository categoryRepository;

    public ItemService(ItemRepository itemRepository, LocationGroupRepository groupRepository,
                       CategoryRepository categoryRepository) {
        this.itemRepository = itemRepository;
        this.groupRepository = groupRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<ItemView> listItems(User user, LocationGroup group) {
        return itemRepository.findByLocationGroupOrderByNameAsc(group).stream()
                .map(ItemService::toView)
                .toList();
    }

    @Transactional(readOnly = true)
    public ItemView view(User user, Long itemId) {
        return toView(require(user, itemId));
    }

    @Transactional(readOnly = true)
    public Item require(User user, Long itemId) {
        return itemRepository.findByIdAndUser(itemId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Item"));
    }

    @Transactional(readOnly = true)
    public Optional<Item> findDuplicate(User user, String name, Long categoryId, Long locationGroupId) {
        DuplicateIndex index = new DuplicateIndex(itemRepository.findByUser(user));
        return index.find(name, categoryId, locationGroupId);
    }

    @Transactional
    public Item createItemWithBatch(User user, Long groupId, String name, Long categoryId,
                                    int quantity, LocalDate expirationDate) {
        LocationGroup group = groupRepository.findByIdAndUser(groupId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Group"));
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category"));
        Item item = new Item(user, name.trim(), category, group);
        Batch batch = new Batch(item, quantity, expirationDate);
        BatchSorter.insertSorted(item.getBatches(), batch);
        return itemRepository.save(item);
    }

    @Transactional
    public Long updateItem(User user, Long itemId, String name, Long categoryId) {
        Item item = require(user, itemId);
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category"));
        item.setName(name.trim());
        item.setCategory(category);
        return item.getLocationGroup().getId();
    }

    @Transactional
    public Long deleteItem(User user, Long itemId) {
        Item item = require(user, itemId);
        Long groupId = item.getLocationGroup().getId();
        itemRepository.delete(item);
        return groupId;
    }

    static ItemView toView(Item item) {
        List<BatchView> batches = item.getBatches().stream()
                .map(b -> new BatchView(b.getId(), b.getQuantity(), b.getExpirationDate(), b.getDateAdded()))
                .toList();
        return new ItemView(item.getId(), item.getName(), item.getCategory().getName(),
                item.totalQuantity(), batches);
    }
}
