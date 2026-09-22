package com.pantry.tracker.inventory;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class ExpiringSoonHeapTest {

    private record Entry(String name, LocalDate expiration) {
    }

    private ExpiringSoonHeap<Entry> heapOfThree() {
        ExpiringSoonHeap<Entry> heap = new ExpiringSoonHeap<>(Entry::expiration);
        heap.add(new Entry("b", LocalDate.of(2026, 1, 10)));
        heap.add(new Entry("a", LocalDate.of(2026, 1, 5)));
        heap.add(new Entry("c", LocalDate.of(2026, 1, 20)));
        return heap;
    }

    @Test
    void peekReturnsEarliestWithoutRemoving() {
        ExpiringSoonHeap<Entry> heap = heapOfThree();

        assertThat(heap.peek()).get().extracting(Entry::name).isEqualTo("a");
        assertThat(heap.peek()).isPresent();
    }

    @Test
    void topNReturnsEarliestFirstAndCaps() {
        ExpiringSoonHeap<Entry> heap = heapOfThree();

        assertThat(heap.topN(2)).extracting(Entry::name).containsExactly("a", "b");
        assertThat(heap.topN(5)).extracting(Entry::name).containsExactly("c");
        assertThat(heap.isEmpty()).isTrue();
    }
}
