package com.pantry.tracker.repository;

import com.pantry.tracker.model.UniversalCategory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UniversalCategoryRepository extends JpaRepository<UniversalCategory, Long> {

    List<UniversalCategory> findAllByOrderByNameAsc();

    boolean existsByNameIgnoreCase(String name);
}
