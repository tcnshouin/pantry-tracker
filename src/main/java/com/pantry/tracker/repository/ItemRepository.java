package com.pantry.tracker.repository;

import com.pantry.tracker.model.Category;
import com.pantry.tracker.model.Item;
import com.pantry.tracker.model.LocationGroup;
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

    long countByCategory(Category category);

    @Query("select i.category.id, count(i) from Item i where i.userId = :userId group by i.category.id")
    List<Object[]> countPerCategory(@Param("userId") UUID userId);
}
