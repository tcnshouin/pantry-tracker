package com.pantry.tracker.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class InputLimitsTest {

    @Test
    void textIsTrimmedAndChecked() {
        assertThat(InputLimits.text("  Rice  ", 60, "Item name")).isEqualTo("Rice");
        assertThat(InputLimits.text("x".repeat(60), 60, "Item name")).hasSize(60);
        assertThatThrownBy(() -> InputLimits.text("x".repeat(61), 60, "Item name"))
                .hasMessage("Item name can be at most 60 characters (you entered 61)");
        assertThatThrownBy(() -> InputLimits.text("   ", 60, "Item name")).hasMessage("Item name is required");
        assertThat(InputLimits.optionalText(null, 40, "Category group")).isEmpty();
    }

    @Test
    void numbersStayInRange() {
        assertThat(InputLimits.quantity(9999, 1)).isEqualTo(9999);
        assertThatThrownBy(() -> InputLimits.quantity(10000, 1)).hasMessage("Quantity must be between 1 and 9,999");
        assertThatThrownBy(() -> InputLimits.quantity(0, 1)).hasMessage("Quantity must be between 1 and 9,999");
        assertThat(InputLimits.quantity(0, 0)).isZero();
        assertThat(InputLimits.total(-3)).isZero();
        assertThatThrownBy(() -> InputLimits.total(10000)).hasMessage("A quantity can't go above 9,999");
    }

    @Test
    void datesStayInRange() {
        assertThat(InputLimits.date(null, "Expiration date")).isNull();
        assertThat(InputLimits.date(LocalDate.of(2099, 12, 31), "Expiration date")).isNotNull();
        assertThatThrownBy(() -> InputLimits.date(LocalDate.of(20255, 1, 1), "Expiration date"))
                .hasMessage("Expiration date must be between 2000 and 2099");
        assertThatThrownBy(() -> InputLimits.date(LocalDate.of(1999, 12, 31), "Date added"))
                .hasMessage("Date added must be between 2000 and 2099");
    }

    @Test
    void shelfLifeIsCappedAtTenYears() {
        assertThat(CategoryService.toDays(10, "years", false)).isEqualTo(3650);
        assertThatThrownBy(() -> CategoryService.toDays(11, "years", false))
                .hasMessage("Shelf life can be at most 10 years (3,650 days)");
        assertThatThrownBy(() -> CategoryService.toDays(Integer.MAX_VALUE, "years", false))
                .hasMessageStartingWith("Shelf life can be at most 10 years");
    }
}
