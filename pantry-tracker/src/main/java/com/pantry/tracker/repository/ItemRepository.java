package com.pantry.tracker.repository;

import com.pantry.tracker.model.Item;
import com.pantry.tracker.model.LocationGroup;
import com.pantry.tracker.model.User;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findByUser(User user);

    List<Item> findByLocationGroupOrderByNameAsc(LocationGroup locationGroup);

    List<Item> findByPurgeOverrideFalseAndEmptySinceBefore(Instant cutoff);

    Optional<Item> findByIdAndUser(Long id, User user);

    long countByLocationGroup(LocationGroup locationGroup);
}
