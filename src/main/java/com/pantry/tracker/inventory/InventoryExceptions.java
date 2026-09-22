package com.pantry.tracker.inventory;

public final class InventoryExceptions {

    private InventoryExceptions() {
    }

    public static class DuplicateGroupNameException extends RuntimeException {
        public DuplicateGroupNameException(String name) {
            super("A group named " + name + " already exists");
        }
    }

    public static class GroupNotEmptyException extends RuntimeException {
        public GroupNotEmptyException() {
            super("Move or remove its items before deleting this group");
        }
    }

    public static class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String what) {
            super(what + " not found");
        }
    }
}
