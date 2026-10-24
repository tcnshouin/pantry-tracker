package com.pantry.tracker.service;

import java.text.NumberFormat;
import java.time.LocalDate;
import java.util.Locale;

public final class InputLimits {

    public static final int ITEM_NAME = 60;
    public static final int LOCATION_NAME = 40;
    public static final int CATEGORY_NAME = 50;
    public static final int CATEGORY_GROUP = 40;
    public static final int SEARCH = 60;
    public static final int EMAIL = 254;
    public static final int PASSWORD = 72;
    public static final int QUANTITY_MAX = 9999;
    public static final int SHELF_LIFE_MAX_DAYS = 3650;
    public static final LocalDate DATE_MIN = LocalDate.of(2000, 1, 1);
    public static final LocalDate DATE_MAX = LocalDate.of(2099, 12, 31);

    private InputLimits() {
    }

    public static String text(String value, int max, String label) {
        String trimmed = value == null ? "" : value.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException(label + " is required");
        }
        if (trimmed.length() > max) {
            throw new IllegalArgumentException(label + " can be at most " + max + " characters (you entered "
                    + trimmed.length() + ")");
        }
        return trimmed;
    }

    public static String optionalText(String value, int max, String label) {
        String trimmed = value == null ? "" : value.trim();
        if (trimmed.length() > max) {
            throw new IllegalArgumentException(label + " can be at most " + max + " characters (you entered "
                    + trimmed.length() + ")");
        }
        return trimmed;
    }

    public static int number(int value, int min, int max, String label) {
        if (value < min || value > max) {
            throw new IllegalArgumentException(label + " must be between " + format(min) + " and " + format(max));
        }
        return value;
    }

    public static int quantity(int value, int min) {
        return number(value, min, QUANTITY_MAX, "Quantity");
    }

    public static int total(int value) {
        if (value > QUANTITY_MAX) {
            throw new IllegalArgumentException("A quantity can't go above " + format(QUANTITY_MAX));
        }
        return Math.max(0, value);
    }

    public static LocalDate date(LocalDate value, String label) {
        if (value != null && (value.isBefore(DATE_MIN) || value.isAfter(DATE_MAX))) {
            throw new IllegalArgumentException(label + " must be between " + DATE_MIN.getYear() + " and "
                    + DATE_MAX.getYear());
        }
        return value;
    }

    public static String format(int value) {
        return NumberFormat.getIntegerInstance(Locale.US).format(value);
    }
}
