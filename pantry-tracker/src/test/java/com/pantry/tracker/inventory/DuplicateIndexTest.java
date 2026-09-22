package com.pantry.tracker.inventory;

import static org.assertj.core.api.Assertions.assertThat;

import com.pantry.tracker.category.Category;
import java.util.List;
import org.junit.jupiter.api.Test;

class DuplicateIndexTest {

    private Item item(String name, long categoryId, long locationId) {
        Category category = new Category();
        category.setId(categoryId);
        category.setName("c" + categoryId);
        LocationGroup group = new LocationGroup();
        group.setId(locationId);
        Item item = new Item();
        item.setName(name);
        item.setCategory(category);
        item.setLocationGroup(group);
        return item;
    }

    @Test
    void matchesCaseInsensitivelyAndTrimmed() {
        DuplicateIndex index = new DuplicateIndex(List.of(item("Rice", 1L, 1L)));

        assertThat(index.find("rice", 1L, 1L)).isPresent();
        assertThat(index.find("  RICE ", 1L, 1L)).isPresent();
    }

    @Test
    void missesWhenCategoryOrLocationDiffers() {
        DuplicateIndex index = new DuplicateIndex(List.of(item("Rice", 1L, 1L)));

        assertThat(index.find("Rice", 2L, 1L)).isEmpty();
        assertThat(index.find("Rice", 1L, 2L)).isEmpty();
    }
}
