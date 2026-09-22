package com.pantry.tracker.inventory;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class ExpiryCalculatorTest {

    @Test
    void addsShelfLifeDaysToDateAdded() {
        assertThat(ExpiryCalculator.compute(3, LocalDate.of(2026, 1, 1)))
                .isEqualTo(LocalDate.of(2026, 1, 4));
        assertThat(ExpiryCalculator.compute(730, LocalDate.of(2026, 1, 1)))
                .isEqualTo(LocalDate.of(2026, 1, 1).plusDays(730));
    }

    @Test
    void nullDateAddedUsesToday() {
        assertThat(ExpiryCalculator.compute(7, null))
                .isEqualTo(LocalDate.now().plusDays(7));
    }
}
