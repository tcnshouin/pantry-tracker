package com.pantry.tracker.inventory;

import com.pantry.tracker.category.Category;
import com.pantry.tracker.user.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "item")
@Getter
@Setter
@NoArgsConstructor
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @ManyToOne(optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(optional = false)
    @JoinColumn(name = "location_group_id", nullable = false)
    private LocationGroup locationGroup;

    @Column(name = "low_stock_enabled", nullable = false)
    private boolean lowStockEnabled = false;

    @Column(name = "low_stock_threshold")
    private Integer lowStockThreshold;

    @Column(name = "purge_override", nullable = false)
    private boolean purgeOverride = false;

    @Column(name = "low_stock_suggested", nullable = false)
    private boolean lowStockSuggested = false;

    @Column(name = "empty_since")
    private Instant emptySince;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("expirationDate asc")
    private List<Batch> batches = new ArrayList<>();

    public Item(User user, String name, Category category, LocationGroup locationGroup) {
        this.user = user;
        this.name = name;
        this.category = category;
        this.locationGroup = locationGroup;
    }

    public int totalQuantity() {
        return batches.stream().mapToInt(Batch::getQuantity).sum();
    }
}
