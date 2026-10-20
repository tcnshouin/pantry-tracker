package com.pantry.tracker.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "grocery_list_item")
@Getter
@Setter
@NoArgsConstructor
public class GroceryListItem {

    public enum Source { AUTO, MANUAL }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne
    @JoinColumn(name = "item_id")
    private Item item;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(name = "quantity_needed", nullable = false)
    private int quantityNeeded;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Source source;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public GroceryListItem(UUID userId, Item item, String itemName, int quantityNeeded, Source source) {
        this.userId = userId;
        this.item = item;
        this.itemName = itemName;
        this.quantityNeeded = quantityNeeded;
        this.source = source;
    }
}
