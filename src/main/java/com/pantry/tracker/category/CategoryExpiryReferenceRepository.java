package com.pantry.tracker.category;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CategoryExpiryReferenceRepository extends JpaRepository<CategoryExpiryReference, Long> {

    @Query("select r.lowerBoundShelfLifeDays from CategoryExpiryReference r "
            + "where r.category.id = :categoryId")
    Optional<Integer> findShelfLifeDaysByCategoryId(@Param("categoryId") Long categoryId);
}
