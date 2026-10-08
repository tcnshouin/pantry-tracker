package com.pantry.tracker.service;

import com.pantry.tracker.model.Batch;
import com.pantry.tracker.model.Item;
import com.pantry.tracker.model.Views.ExpiringEntry;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Deque;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.PriorityQueue;

public final class DataStructures {

    private DataStructures() {
    }

    public static class DuplicateIndex {

        private final Map<String, Item> index = new HashMap<>();

        public DuplicateIndex(List<Item> items) {
            for (Item item : items) {
                index.put(key(item.getName(), item.getCategory().getId(), item.getLocationGroup().getId()), item);
            }
        }

        public Item find(String name, Long categoryId, Long locationGroupId) {
            return index.get(key(name, categoryId, locationGroupId));
        }

        static String key(String name, Long categoryId, Long locationGroupId) {
            String normalized = name == null ? "" : name.trim().toLowerCase(Locale.ROOT);
            return normalized + "|" + categoryId + "|" + locationGroupId;
        }
    }

    public static void insertSorted(List<Batch> batches, Batch incoming) {
        batches.add(incoming);
        int i = batches.size() - 2;
        while (i >= 0 && comesBefore(incoming, batches.get(i))) {
            batches.set(i + 1, batches.get(i));
            i--;
        }
        batches.set(i + 1, incoming);
    }

    private static boolean comesBefore(Batch a, Batch b) {
        if (a.getExpirationDate() == null) {
            return false;
        }
        if (b.getExpirationDate() == null) {
            return true;
        }
        return a.getExpirationDate().isBefore(b.getExpirationDate());
    }

    public static class ExpiringSoonHeap {

        private final PriorityQueue<ExpiringEntry> heap =
                new PriorityQueue<>(Comparator.comparing(ExpiringEntry::expirationDate));

        public void add(ExpiringEntry entry) {
            heap.add(entry);
        }

        public ExpiringEntry peek() {
            return heap.peek();
        }

        public List<ExpiringEntry> topN(int n) {
            List<ExpiringEntry> result = new ArrayList<>();
            while (!heap.isEmpty() && result.size() < n) {
                result.add(heap.poll());
            }
            return result;
        }

        public boolean isEmpty() {
            return heap.isEmpty();
        }
    }

    public static class UndoStack implements Serializable {

        private static final int MAX_SIZE = 50;

        private final Deque<UndoAction> stack = new ArrayDeque<>();

        public void push(UndoAction action) {
            stack.push(action);
            if (stack.size() > MAX_SIZE) {
                stack.removeLast();
            }
        }

        public UndoAction pop() {
            return stack.isEmpty() ? null : stack.pop();
        }

        public String peekLabel() {
            return stack.isEmpty() ? null : stack.peek().getLabel();
        }

        public boolean isEmpty() {
            return stack.isEmpty();
        }
    }

    public static class UndoAction implements Serializable {

        public enum Type {
            DELETE_ITEM, RESTORE_ITEM, RECREATE_ITEM, DELETE_BATCH, RESTORE_BATCH, RECREATE_BATCH
        }

        Type type;
        String label;
        Long itemId;
        Long batchId;
        Long groupId;
        Long categoryId;
        String name;
        boolean lowStockEnabled;
        Integer lowStockThreshold;
        boolean purgeOverride;
        int quantity;
        LocalDate expirationDate;
        LocalDate dateAdded;
        boolean autoExpiry;
        List<UndoAction> batches = new ArrayList<>();

        UndoAction(Type type, String label) {
            this.type = type;
            this.label = label;
        }

        public String getLabel() {
            return label;
        }

        static UndoAction copyOf(Batch batch, Type type, String label) {
            UndoAction action = new UndoAction(type, label);
            action.batchId = batch.getId();
            action.itemId = batch.getItem().getId();
            action.quantity = batch.getQuantity();
            action.expirationDate = batch.getExpirationDate();
            action.dateAdded = batch.getDateAdded();
            action.autoExpiry = batch.isAutoExpiry();
            action.purgeOverride = batch.isPurgeOverride();
            return action;
        }
    }
}
