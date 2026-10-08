package com.pantry.tracker.repository;

import com.pantry.tracker.model.GroceryListItem;
import com.pantry.tracker.model.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroceryListItemRepository extends JpaRepository<GroceryListItem, Long> {

    List<GroceryListItem> findByUserAndSourceOrderByCreatedAtDesc(User user, GroceryListItem.Source source);

    Optional<GroceryListItem> findByIdAndUser(Long id, User user);

    long countByUserAndPurchasedFalse(User user);
}
