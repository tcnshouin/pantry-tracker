package com.pantry.tracker.inventory;

import static org.assertj.core.api.Assertions.assertThat;

import com.pantry.tracker.category.Category;
import com.pantry.tracker.category.CategoryRepository;
import com.pantry.tracker.inventory.PurgeService.PurgeResult;
import com.pantry.tracker.user.User;
import com.pantry.tracker.user.UserRepository;
import java.time.Duration;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.context.annotation.Import;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(PurgeService.class)
class PurgeServiceIntegrationTest {

    @Autowired
    private TestEntityManager em;

    @Autowired
    private UserRepository users;

    @Autowired
    private CategoryRepository categories;

    @Autowired
    private LocationGroupRepository groups;

    @Autowired
    private ItemRepository items;

    @Autowired
    private BatchRepository batches;

    @Autowired
    private PurgeService purgeService;

    private Instant daysAgo(int days) {
        return Instant.now().minus(Duration.ofDays(days));
    }

    @Test
    void sweepDeletesStaleEmptiesAndHonoursOverrides() {
        User user = users.save(new User("purge@example.com", "hash"));
        Category category = categories.findAll().get(0);
        LocationGroup group = groups.save(new LocationGroup(user, "Pantry"));

        Item stale = new Item(user, "Stale", category, group);
        stale.setEmptySince(daysAgo(8));
        items.save(stale);

        Item kept = new Item(user, "Kept", category, group);
        kept.setEmptySince(daysAgo(8));
        kept.setPurgeOverride(true);
        items.save(kept);

        Item stocked = new Item(user, "Stocked", category, group);
        Batch fresh = new Batch(stocked, 5, null);
        Batch oldEmpty = new Batch(stocked, 0, null);
        oldEmpty.setEmptySince(daysAgo(4));
        stocked.getBatches().add(fresh);
        stocked.getBatches().add(oldEmpty);
        items.save(stocked);

        Long staleId = stale.getId();
        Long keptId = kept.getId();
        Long stockedId = stocked.getId();
        Long oldEmptyId = oldEmpty.getId();
        Long freshId = fresh.getId();
        em.flush();
        em.clear();

        PurgeResult result = purgeService.sweep(Instant.now());
        em.flush();
        em.clear();

        assertThat(result.itemsPurged()).isEqualTo(1);
        assertThat(result.batchesPurged()).isEqualTo(1);
        assertThat(items.findById(staleId)).isEmpty();
        assertThat(items.findById(keptId)).isPresent();
        assertThat(items.findById(stockedId)).isPresent();
        assertThat(batches.findById(oldEmptyId)).isEmpty();
        assertThat(batches.findById(freshId)).isPresent();
    }
}
