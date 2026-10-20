package com.pantry.tracker.repository;

import com.pantry.tracker.model.Category;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByUserIdOrderByNameAsc(UUID userId);

    List<Category> findByUserIdIsNullOrderByNameAsc();

    Optional<Category> findByIdAndUserId(Long id, UUID userId);

    boolean existsByUserIdAndNameIgnoreCase(UUID userId, String name);

    long countByUserId(UUID userId);
}
