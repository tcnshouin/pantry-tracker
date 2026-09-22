package com.pantry.tracker.inventory;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.PriorityQueue;
import java.util.function.Function;

public class ExpiringSoonHeap<T> {

    private final PriorityQueue<T> heap;

    public ExpiringSoonHeap(Function<T, LocalDate> expirationOf) {
        this.heap = new PriorityQueue<>(Comparator.comparing(expirationOf));
    }

    public void add(T entry) {
        heap.add(entry);
    }

    public Optional<T> peek() {
        return Optional.ofNullable(heap.peek());
    }

    public List<T> topN(int n) {
        List<T> ordered = new ArrayList<>();
        while (!heap.isEmpty() && ordered.size() < n) {
            ordered.add(heap.poll());
        }
        return ordered;
    }

    public boolean isEmpty() {
        return heap.isEmpty();
    }
}
