package com.pantry.tracker.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
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

    @Column(nullable = false, unique = true)
    private String name;
}

@Entity
@Table(name = "category_expiry_reference")
@Getter
@Setter
@NoArgsConstructor
class CategoryExpiryReference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "category_id", nullable = false, unique = true)
    private Category category;

    @Column(name = "lower_bound_shelf_life_days", nullable = false)
    private Integer lowerBoundShelfLifeDays;

    @Column(name = "source_note", nullable = false)
    private String sourceNote;
}
