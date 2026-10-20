package com.pantry.tracker.repository;

import com.pantry.tracker.model.LocationGroup;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocationGroupRepository extends JpaRepository<LocationGroup, Long> {

    List<LocationGroup> findByUserIdOrderByNameAsc(UUID userId);

    Optional<LocationGroup> findByIdAndUserId(Long id, UUID userId);

    boolean existsByUserIdAndNameIgnoreCase(UUID userId, String name);
}
