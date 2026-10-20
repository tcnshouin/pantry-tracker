package com.pantry.tracker.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pantry.tracker.model.Category;
import com.pantry.tracker.model.Views;
import com.pantry.tracker.model.Views.CategoryOption;
import com.pantry.tracker.repository.CategoryRepository;
import com.pantry.tracker.repository.ItemRepository;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ItemRepository itemRepository;

    @InjectMocks
    private CategoryService categoryService;

    private final UUID user = UUID.randomUUID();

    @Test
    void shelfLifeIsShownInYearsMonthsWeeksOrDays() {
        assertThat(Views.shelfLifeText(730)).isEqualTo("2 years (730 days)");
        assertThat(Views.shelfLifeText(365)).isEqualTo("1 year (365 days)");
        assertThat(Views.shelfLifeText(180)).isEqualTo("6 months (180 days)");
        assertThat(Views.shelfLifeText(21)).isEqualTo("3 weeks (21 days)");
        assertThat(Views.shelfLifeText(3)).isEqualTo("3 days");
        assertThat(Views.shelfLifeText(1)).isEqualTo("1 day");
        assertThat(Views.shelfLifeText(null)).isEqualTo("Set manually");
    }

    @Test
    void editFormPicksTheLargestWholeUnit() {
        CategoryOption twoYears = new CategoryOption(1L, "Rice", "Rice & Grains", 730);
        assertThat(twoYears.shelfLifeUnit()).isEqualTo("years");
        assertThat(twoYears.shelfLifeAmount()).isEqualTo(2);
        CategoryOption sixMonths = new CategoryOption(2L, "Flour", "Baking", 180);
        assertThat(sixMonths.shelfLifeUnit()).isEqualTo("months");
        assertThat(sixMonths.shelfLifeAmount()).isEqualTo(6);
    }

    @Test
    void shelfLifeUnitsConvertToDays() {
        assertThat(CategoryService.toDays(2, "years", false)).isEqualTo(730);
        assertThat(CategoryService.toDays(6, "months", false)).isEqualTo(180);
        assertThat(CategoryService.toDays(3, "weeks", false)).isEqualTo(21);
        assertThat(CategoryService.toDays(5, "days", false)).isEqualTo(5);
        assertThat(CategoryService.toDays(null, "days", true)).isNull();
        assertThatThrownBy(() -> CategoryService.toDays(0, "days", false)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void duplicateNamesAreRejectedAndBlankGroupBecomesOthers() {
        when(categoryRepository.existsByUserIdAndNameIgnoreCase(user, "Rice")).thenReturn(true);
        assertThatThrownBy(() -> categoryService.create(user, " Rice ", "Rice & Grains", 2, "years", false))
                .isInstanceOf(IllegalArgumentException.class);

        when(categoryRepository.existsByUserIdAndNameIgnoreCase(user, "Kakanin")).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> {
            Category saved = inv.getArgument(0);
            assertThat(saved.getGroupName()).isEqualTo("Others");
            assertThat(saved.getShelfLifeDays()).isEqualTo(3);
            return saved;
        });
        categoryService.create(user, "Kakanin", "  ", 3, "days", false);
    }

    @Test
    void deleteIsBlockedWhileItemsUseTheCategory() {
        Category rice = new Category(user, "Rice", "Rice & Grains", 730);
        when(categoryRepository.findByIdAndUserId(5L, user)).thenReturn(Optional.of(rice));
        when(itemRepository.countByCategory(rice)).thenReturn(3L);

        assertThatThrownBy(() -> categoryService.delete(user, 5L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("3 items");
        verify(categoryRepository, never()).delete(any());
    }
}
