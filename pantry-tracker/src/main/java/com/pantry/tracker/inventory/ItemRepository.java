package com.pantry.tracker.inventory;

import com.pantry.tracker.user.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findByUser(User user);

    List<Item> findByLocationGroupOrderByNameAsc(LocationGroup locationGroup);

    Optional<Item> findByIdAndUser(Long id, User user);

    long countByLocationGroup(LocationGroup locationGroup);
}
