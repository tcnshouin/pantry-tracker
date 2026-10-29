package com.pantry.tracker.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.pantry.tracker.model.Batch;
import com.pantry.tracker.model.Item;
import com.pantry.tracker.model.LocationGroup;
import com.pantry.tracker.model.UniversalCategory;
import com.pantry.tracker.model.UserCategory;
import com.pantry.tracker.model.Views.CategoryOption;
import com.pantry.tracker.service.CategoryService;
import com.pantry.tracker.service.InventoryService;
import com.pantry.tracker.service.InventoryService.PurgeResult;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.context.annotation.Import;

@DataJpaTest
@EnabledIf("com.pantry.tracker.SupabaseAvailable#configured")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import({InventoryService.class, CategoryService.class})
class RepositoryTest {

    @Autowired
    private TestEntityManager em;

    @Autowired
    private UniversalCategoryRepository universal;

    @Autowired
    private UserCategoryRepository userCategories;

    @Autowired
    private LocationGroupRepository groups;

    @Autowired
    private ItemRepository items;

    @Autowired
    private BatchRepository batches;

    @Autowired
    private InventoryService inventory;

    @Autowired
    private CategoryService categoryService;

    @Test
    void newUserSeesTheUniversalListWithoutCopies() {
        List<UniversalCategory> defaults = universal.findAllByOrderByNameAsc();
        assertThat(defaults).hasSizeGreaterThan(80);
        assertThat(defaults).allSatisfy(c -> assertThat(c.getGroupName()).isNotBlank());
        assertThat(defaults).filteredOn(c -> c.getName().equals("Others"))
                .singleElement().satisfies(c -> assertThat(c.getShelfLifeDays()).isNull());
        assertThat(defaults).filteredOn(c -> c.getName().equals("Bread"))
                .singleElement().satisfies(c -> assertThat(c.getShelfLifeDays()).isEqualTo(3));

        UUID newUser = UUID.randomUUID();
        List<CategoryOption> options = categoryService.options(newUser);

        assertThat(options).hasSize(defaults.size()).allSatisfy(o -> assertThat(o.universal()).isTrue());
        assertThat(userCategories.findByUserIdOrderByNameAsc(newUser)).isEmpty();
    }

    @Test
    void userCategoriesAreOnlyVisibleToTheirOwner() {
        UUID owner = UUID.randomUUID();
        UUID other = UUID.randomUUID();
        UserCategory kakanin = userCategories.save(new UserCategory(owner, "Kakanin", "Snacks", 3));

        assertThat(categoryService.options(owner)).extracting(CategoryOption::name).contains("Kakanin");
        assertThat(categoryService.options(other)).extracting(CategoryOption::name).doesNotContain("Kakanin");
        assertThat(categoryService.resolve(other, kakanin.getId())).isEmpty();
        assertThat(categoryService.resolve(owner, kakanin.getId())).containsSame(kakanin);
    }

    @Test
    void databaseRefusesToDeleteUniversalCategories() {
        assertThatThrownBy(() -> em.getEntityManager()
                .createNativeQuery("delete from universal_category where name = 'Rice'").executeUpdate())
                .hasMessageContaining("read-only");
    }

    @Test
    void itemMustPointToExactlyOneCategory() {
        UUID user = UUID.randomUUID();
        LocationGroup group = groups.save(new LocationGroup(user, "Pantry"));
        Item orphan = new Item(user, "Orphan", null, group);

        assertThatThrownBy(() -> items.saveAndFlush(orphan)).hasMessageContaining("item_one_category");
    }

    @Test
    void purgeRemovesOldEmptiesButRespectsKeep() {
        Instant eightDaysAgo = Instant.now().minus(Duration.ofDays(8));
        UUID user = UUID.randomUUID();
        UniversalCategory category = universal.findAllByOrderByNameAsc().get(0);
        LocationGroup group = groups.save(new LocationGroup(user, "Pantry"));

        Item stale = new Item(user, "Stale", category, group);
        stale.setEmptySince(eightDaysAgo);
        items.save(stale);

        Item kept = new Item(user, "Kept", category, group);
        kept.setEmptySince(eightDaysAgo);
        kept.setPurgeOverride(true);
        items.save(kept);

        Item stocked = new Item(user, "Stocked", category, group);
        Batch fresh = new Batch(stocked, 5, null);
        Batch oldEmpty = new Batch(stocked, 0, null);
        oldEmpty.setEmptySince(Instant.now().minus(Duration.ofDays(4)));
        stocked.getBatches().add(fresh);
        stocked.getBatches().add(oldEmpty);
        items.save(stocked);
        em.flush();
        em.clear();

        PurgeResult result = inventory.purgeSweep(Instant.now());
        em.flush();
        em.clear();

        assertThat(result.itemsPurged()).isGreaterThanOrEqualTo(1);
        assertThat(result.batchesPurged()).isGreaterThanOrEqualTo(1);
        assertThat(items.findById(stale.getId())).isEmpty();
        assertThat(items.findById(kept.getId())).isPresent();
        assertThat(batches.findById(oldEmpty.getId())).isEmpty();
        assertThat(batches.findById(fresh.getId())).isPresent();
    }
}
