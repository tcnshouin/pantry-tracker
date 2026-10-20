package com.pantry.tracker.repository;

import com.pantry.tracker.model.Batch;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BatchRepository extends JpaRepository<Batch, Long> {

    Optional<Batch> findByIdAndItemUserId(Long id, UUID userId);

    List<Batch> findByPurgeOverrideFalseAndEmptySinceBefore(Instant cutoff);

    List<Batch> findTop8ByItemUserIdOrderByIdDesc(UUID userId);
}
