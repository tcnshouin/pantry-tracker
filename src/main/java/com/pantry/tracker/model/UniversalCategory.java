package com.pantry.tracker.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "universal_category")
@NoArgsConstructor
public class UniversalCategory extends CategoryBase {

    public UniversalCategory(String name, String groupName, Integer shelfLifeDays) {
        super(name, groupName, shelfLifeDays);
    }

    @Override
    public boolean isUniversal() {
        return true;
    }
}
