package com.pantry.tracker.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "category")
@Getter
@Setter
@NoArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private UUID userId;

    @Column(nullable = false)
    private String name;

    @Column(name = "group_name")
    private String groupName;

    @Column(name = "shelf_life_days")
    private Integer shelfLifeDays;

    public Category(UUID userId, String name, String groupName, Integer shelfLifeDays) {
        this.userId = userId;
        this.name = name;
        this.groupName = groupName;
        this.shelfLifeDays = shelfLifeDays;
    }
}
