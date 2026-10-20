package com.pantry.tracker.repository;

import com.pantry.tracker.model.GroceryListItem;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroceryListItemRepository extends JpaRepository<GroceryListItem, Long> {

    List<GroceryListItem> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<GroceryListItem> findByUserIdAndIdIn(UUID userId, Collection<Long> ids);

    Optional<GroceryListItem> findByIdAndUserId(Long id, UUID userId);

    long countByUserId(UUID userId);
}
