package com.pantry.tracker.repository;

import com.pantry.tracker.model.Batch;
import com.pantry.tracker.model.User;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BatchRepository extends JpaRepository<Batch, Long> {

    Optional<Batch> findByIdAndItemUser(Long id, User user);

    List<Batch> findByPurgeOverrideFalseAndEmptySinceBefore(Instant cutoff);
}
