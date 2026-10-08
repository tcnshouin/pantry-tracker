package com.pantry.tracker.repository;

import com.pantry.tracker.model.Category;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    @Query("select c.id, c.name, r.lowerBoundShelfLifeDays "
            + "from Category c join CategoryExpiryReference r on r.category = c order by c.name")
    List<Object[]> findOptionRows();

    @Query("select r.lowerBoundShelfLifeDays from CategoryExpiryReference r where r.category.id = :categoryId")
    Optional<Integer> findShelfLifeDays(@Param("categoryId") Long categoryId);
}
