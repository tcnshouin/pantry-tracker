package com.pantry.tracker.model;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@MappedSuperclass
@Getter
@Setter
@NoArgsConstructor
public abstract class CategoryBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "group_name")
    private String groupName;

    @Column(name = "shelf_life_days")
    private Integer shelfLifeDays;

    protected CategoryBase(String name, String groupName, Integer shelfLifeDays) {
        this.name = name;
        this.groupName = groupName;
        this.shelfLifeDays = shelfLifeDays;
    }

    public abstract boolean isUniversal();
}
