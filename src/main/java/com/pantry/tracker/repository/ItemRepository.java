package com.pantry.tracker.repository;

import com.pantry.tracker.model.Item;
import com.pantry.tracker.model.LocationGroup;
import com.pantry.tracker.model.UserCategory;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findByUserId(UUID userId);

    List<Item> findByUserIdOrderByCreatedAtAscIdAsc(UUID userId);

    List<Item> findByLocationGroupOrderByNameAsc(LocationGroup locationGroup);

    List<Item> findByPurgeOverrideFalseAndEmptySinceBefore(Instant cutoff);

    Optional<Item> findByIdAndUserId(Long id, UUID userId);

    long countByLocationGroup(LocationGroup locationGroup);

    long countByUserCategory(UserCategory userCategory);

    @Query("select coalesce(uc.id, c.id), count(i) from Item i left join i.universalCategory uc"
            + " left join i.userCategory c where i.userId = :userId group by coalesce(uc.id, c.id)")
    List<Object[]> countPerCategory(@Param("userId") UUID userId);
}
