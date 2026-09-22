package com.pantry.tracker.category;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class CategorySeedTest {

    @Autowired
    private CategoryRepository categoryRepository;

    @Test
    void seedLoadsFifteenCategoriesEachWithShelfLife() {
        List<CategoryOption> options = categoryRepository.findOptions();

        assertThat(options).hasSize(15);
        assertThat(options).allSatisfy(opt -> {
            assertThat(opt.name()).isNotBlank();
            assertThat(opt.shelfLifeDays()).isPositive();
        });
    }

    @Test
    void breadHasThreeDayLowerBound() {
        List<CategoryOption> options = categoryRepository.findOptions();

        assertThat(options)
                .filteredOn(opt -> opt.name().startsWith("Bread"))
                .singleElement()
                .satisfies(opt -> assertThat(opt.shelfLifeDays()).isEqualTo(3));
    }
}
