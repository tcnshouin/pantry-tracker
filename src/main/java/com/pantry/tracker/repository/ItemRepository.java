package com.pantry.tracker.repository;

import com.pantry.tracker.model.Item;
import com.pantry.tracker.model.LocationGroup;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findByUserId(UUID userId);

    List<Item> findByUserIdOrderByCreatedAtAscIdAsc(UUID userId);

    List<Item> findByLocationGroupOrderByNameAsc(LocationGroup locationGroup);

    List<Item> findByPurgeOverrideFalseAndEmptySinceBefore(Instant cutoff);

    Optional<Item> findByIdAndUserId(Long id, UUID userId);

    long countByLocationGroup(LocationGroup locationGroup);
}
