package com.pantry.tracker.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "batch")
@Getter
@Setter
@NoArgsConstructor
public class Batch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "expiration_date")
    private LocalDate expirationDate;

    @Column(name = "auto_expiry", nullable = false)
    private boolean autoExpiry = false;

    @Column(name = "purge_override", nullable = false)
    private boolean purgeOverride = false;

    @Column(name = "empty_since")
    private Instant emptySince;

    @Column(name = "date_added", nullable = false)
    private LocalDate dateAdded = LocalDate.now();

    public Batch(Item item, int quantity, LocalDate expirationDate) {
        this.item = item;
        this.quantity = quantity;
        this.expirationDate = expirationDate;
    }
}
