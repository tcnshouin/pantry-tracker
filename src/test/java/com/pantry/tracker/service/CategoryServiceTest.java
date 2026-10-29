package com.pantry.tracker.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pantry.tracker.model.UniversalCategory;
import com.pantry.tracker.model.UserCategory;
import com.pantry.tracker.model.Views;
import com.pantry.tracker.model.Views.CategoryOption;
import com.pantry.tracker.repository.ItemRepository;
import com.pantry.tracker.repository.UniversalCategoryRepository;
import com.pantry.tracker.repository.UserCategoryRepository;
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
    private UniversalCategoryRepository universalRepository;

    @Mock
    private UserCategoryRepository userRepository;

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
        CategoryOption twoYears = new CategoryOption(1L, "Rice", "Rice & Grains", 730, true);
        assertThat(twoYears.shelfLifeUnit()).isEqualTo("years");
        assertThat(twoYears.shelfLifeAmount()).isEqualTo(2);
        CategoryOption sixMonths = new CategoryOption(2L, "Flour", "Baking", 180, true);
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
        when(userRepository.existsByUserIdAndNameIgnoreCase(user, "Pancit")).thenReturn(true);
        assertThatThrownBy(() -> categoryService.create(user, " Pancit ", "Noodles & Pasta", 2, "years", false))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("You already have");

        when(userRepository.save(any(UserCategory.class))).thenAnswer(inv -> {
            UserCategory saved = inv.getArgument(0);
            assertThat(saved.getUserId()).isEqualTo(user);
            assertThat(saved.getGroupName()).isEqualTo("Others");
            assertThat(saved.getShelfLifeDays()).isEqualTo(3);
            return saved;
        });
        categoryService.create(user, "Kakanin", "  ", 3, "days", false);
    }

    @Test
    void aDefaultCategoryNameCannotBeReused() {
        when(universalRepository.existsByNameIgnoreCase("Rice")).thenReturn(true);

        assertThatThrownBy(() -> categoryService.create(user, "Rice", "Rice & Grains", 2, "years", false))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already a default category");
        verify(userRepository, never()).save(any());
    }

    @Test
    void defaultAndOtherUsersCategoriesCannotBeChangedOrDeleted() {
        when(userRepository.findByIdAndUserId(1L, user)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.delete(user, 1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("can't be changed");
        assertThatThrownBy(() -> categoryService.update(user, 1L, "Rice", "Rice & Grains", 1, "years", false))
                .isInstanceOf(IllegalArgumentException.class);
        verify(userRepository, never()).delete(any());
        verify(universalRepository, never()).delete(any());
    }

    @Test
    void resolveFindsDefaultsAndOnlyTheUsersOwnCategories() {
        UniversalCategory rice = new UniversalCategory("Rice", "Rice & Grains", 730);
        UserCategory kakanin = new UserCategory(user, "Kakanin", "Snacks", 3);
        when(universalRepository.findById(1L)).thenReturn(Optional.of(rice));
        when(universalRepository.findById(9L)).thenReturn(Optional.empty());
        when(universalRepository.findById(10L)).thenReturn(Optional.empty());
        when(userRepository.findByIdAndUserId(9L, user)).thenReturn(Optional.of(kakanin));
        when(userRepository.findByIdAndUserId(10L, user)).thenReturn(Optional.empty());

        assertThat(categoryService.resolve(user, 1L)).containsSame(rice);
        assertThat(categoryService.resolve(user, 9L)).containsSame(kakanin);
        assertThat(categoryService.resolve(user, 10L)).isEmpty();
    }

    @Test
    void deleteIsBlockedWhileItemsUseTheCategory() {
        UserCategory kakanin = new UserCategory(user, "Kakanin", "Snacks", 3);
        when(userRepository.findByIdAndUserId(5L, user)).thenReturn(Optional.of(kakanin));
        when(itemRepository.countByUserCategory(kakanin)).thenReturn(3L);

        assertThatThrownBy(() -> categoryService.delete(user, 5L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("3 items");
        verify(userRepository, never()).delete(any());
    }
}
