package com.pantry.tracker.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.pantry.tracker.model.Batch;
import com.pantry.tracker.model.Category;
import com.pantry.tracker.model.Item;
import com.pantry.tracker.model.LocationGroup;
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
    private CategoryRepository categories;

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
    void starterCategoriesAreCopiedForANewUser() {
        List<Category> templates = categories.findByUserIdIsNullOrderByNameAsc();
        assertThat(templates).hasSizeGreaterThan(80);
        assertThat(templates).allSatisfy(c -> assertThat(c.getGroupName()).isNotBlank());
        assertThat(templates).filteredOn(c -> c.getName().equals("Others"))
                .singleElement().satisfies(c -> assertThat(c.getShelfLifeDays()).isNull());
        assertThat(templates).filteredOn(c -> c.getName().equals("Bread"))
                .singleElement().satisfies(c -> assertThat(c.getShelfLifeDays()).isEqualTo(3));

        UUID newUser = UUID.randomUUID();
        List<CategoryOption> options = categoryService.options(newUser);

        assertThat(options).hasSize(templates.size());
        assertThat(categories.countByUserId(newUser)).isEqualTo(templates.size());
    }

    @Test
    void purgeRemovesOldEmptiesButRespectsKeep() {
        Instant eightDaysAgo = Instant.now().minus(Duration.ofDays(8));
        UUID user = UUID.randomUUID();
        Category category = categories.findAll().get(0);
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
