package com.pantry.tracker.inventory;

import com.pantry.tracker.user.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BatchRepository extends JpaRepository<Batch, Long> {

    Optional<Batch> findByIdAndItemUser(Long id, User user);
}
