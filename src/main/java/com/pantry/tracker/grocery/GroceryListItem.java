package com.pantry.tracker.grocery;

import com.pantry.tracker.inventory.Item;
import com.pantry.tracker.user.User;
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

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "item_id")
    private Item item;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(name = "quantity_needed", nullable = false)
    private int quantityNeeded;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GrocerySource source;

    @Column(nullable = false)
    private boolean purchased = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public GroceryListItem(User user, Item item, String itemName, int quantityNeeded,
                           GrocerySource source) {
        this.user = user;
        this.item = item;
        this.itemName = itemName;
        this.quantityNeeded = quantityNeeded;
        this.source = source;
    }
}
