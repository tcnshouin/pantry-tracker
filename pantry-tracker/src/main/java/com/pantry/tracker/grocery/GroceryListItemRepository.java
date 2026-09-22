package com.pantry.tracker.grocery;

import com.pantry.tracker.inventory.Item;
import com.pantry.tracker.user.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroceryListItemRepository extends JpaRepository<GroceryListItem, Long> {

    List<GroceryListItem> findByUserAndSourceOrderByCreatedAtDesc(User user, GrocerySource source);

    Optional<GroceryListItem> findByIdAndUser(Long id, User user);

    boolean existsByItemAndSourceAndPurchasedFalse(Item item, GrocerySource source);

    long countByUserAndPurchasedFalse(User user);
}
