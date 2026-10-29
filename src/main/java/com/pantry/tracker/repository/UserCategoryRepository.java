package com.pantry.tracker.repository;

import com.pantry.tracker.model.UserCategory;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserCategoryRepository extends JpaRepository<UserCategory, Long> {

    List<UserCategory> findByUserIdOrderByNameAsc(UUID userId);

    Optional<UserCategory> findByIdAndUserId(Long id, UUID userId);

    boolean existsByUserIdAndNameIgnoreCase(UUID userId, String name);
}
