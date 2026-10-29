package com.pantry.tracker.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_category")
@Getter
@Setter
@NoArgsConstructor
public class UserCategory extends CategoryBase {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    public UserCategory(UUID userId, String name, String groupName, Integer shelfLifeDays) {
        super(name, groupName, shelfLifeDays);
        this.userId = userId;
    }

    @Override
    public boolean isUniversal() {
        return false;
    }
}
