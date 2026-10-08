package com.pantry.tracker.repository;

import com.pantry.tracker.model.LocationGroup;
import com.pantry.tracker.model.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocationGroupRepository extends JpaRepository<LocationGroup, Long> {

    List<LocationGroup> findByUserOrderByNameAsc(User user);

    Optional<LocationGroup> findByIdAndUser(Long id, User user);

    boolean existsByUserAndNameIgnoreCase(User user, String name);
}
