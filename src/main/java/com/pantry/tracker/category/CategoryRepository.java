package com.pantry.tracker.category;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    @Query("select new com.pantry.tracker.category.CategoryOption(c.id, c.name, r.lowerBoundShelfLifeDays) "
            + "from Category c join CategoryExpiryReference r on r.category = c order by c.name")
    List<CategoryOption> findOptions();
}
