package com.pantry.tracker.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.pantry.tracker.model.Batch;
import com.pantry.tracker.model.Category;
import com.pantry.tracker.model.Item;
import com.pantry.tracker.model.LocationGroup;
import com.pantry.tracker.model.Views.ExpiringEntry;
import com.pantry.tracker.service.DataStructures.DuplicateIndex;
import com.pantry.tracker.service.DataStructures.ExpiringSoonHeap;
import com.pantry.tracker.service.DataStructures.UndoAction;
import com.pantry.tracker.service.DataStructures.UndoStack;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

class DataStructuresTest {

    private Item item(String name, long categoryId, long groupId) {
        Category category = new Category();
        category.setId(categoryId);
        LocationGroup group = new LocationGroup();
        group.setId(groupId);
        Item item = new Item();
        item.setName(name);
        item.setCategory(category);
        item.setLocationGroup(group);
        return item;
    }

    private Batch batch(LocalDate expiration) {
        Batch batch = new Batch();
        batch.setExpirationDate(expiration);
        return batch;
    }

    private ExpiringEntry entry(String name, LocalDate date) {
        return new ExpiringEntry(name, "Shelf", date, 1, "Expiring soon", "", 1L, 1L);
    }

    @Test
    void hashMapFindsDuplicatesIgnoringCaseAndSpaces() {
        DuplicateIndex index = new DuplicateIndex(List.of(item("Rice", 1L, 1L)));

        assertThat(index.find("rice", 1L, 1L)).isNotNull();
        assertThat(index.find("  RICE ", 1L, 1L)).isNotNull();
        assertThat(index.find("Rice", 2L, 1L)).isNull();
        assertThat(index.find("Rice", 1L, 2L)).isNull();
    }

    @Test
    void insertionSortKeepsBatchesOrderedWithNoDateLast() {
        List<Batch> batches = new ArrayList<>();
        DataStructures.insertSorted(batches, batch(LocalDate.of(2026, 1, 10)));
        DataStructures.insertSorted(batches, batch(null));
        DataStructures.insertSorted(batches, batch(LocalDate.of(2026, 1, 5)));
        DataStructures.insertSorted(batches, batch(LocalDate.of(2026, 1, 20)));
        DataStructures.insertSorted(batches, batch(LocalDate.of(2026, 1, 1)));

        assertThat(batches).extracting(Batch::getExpirationDate).containsExactly(
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 5), LocalDate.of(2026, 1, 10),
                LocalDate.of(2026, 1, 20), null);
    }

    @Test
    void minHeapReturnsEarliestFirst() {
        ExpiringSoonHeap heap = new ExpiringSoonHeap();
        heap.add(entry("b", LocalDate.of(2026, 1, 10)));
        heap.add(entry("a", LocalDate.of(2026, 1, 5)));
        heap.add(entry("c", LocalDate.of(2026, 1, 20)));

        assertThat(heap.peek().itemName()).isEqualTo("a");
        assertThat(heap.topN(2)).extracting(ExpiringEntry::itemName).containsExactly("a", "b");
        assertThat(heap.topN(5)).extracting(ExpiringEntry::itemName).containsExactly("c");
        assertThat(heap.isEmpty()).isTrue();
    }

    @Test
    void undoStackIsLastInFirstOut() {
        UndoStack stack = new UndoStack();
        assertThat(stack.peekLabel()).isNull();

        stack.push(new UndoAction(UndoAction.Type.DELETE_ITEM, "a"));
        stack.push(new UndoAction(UndoAction.Type.DELETE_ITEM, "b"));
        stack.push(new UndoAction(UndoAction.Type.DELETE_ITEM, "c"));

        assertThat(stack.peekLabel()).isEqualTo("c");
        assertThat(stack.pop().getLabel()).isEqualTo("c");
        assertThat(stack.pop().getLabel()).isEqualTo("b");
        assertThat(stack.pop().getLabel()).isEqualTo("a");
        assertThat(stack.isEmpty()).isTrue();
        assertThat(stack.pop()).isNull();
    }
}
