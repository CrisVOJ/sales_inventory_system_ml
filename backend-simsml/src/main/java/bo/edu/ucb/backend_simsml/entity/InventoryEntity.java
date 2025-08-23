package bo.edu.ucb.backend_simsml.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity(name = "inventories")
@Table(name = "inventories")
public class InventoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inventory_id")
    private Long inventoryId;

    @Column(name = "current_stock", nullable = false)
    private Long currentStock;
    @Column(name = "minimum_stock")
    private Long minimumStock;
    @Column(name = "location", nullable = false)
    private String location;

    @Column(name = "active")
    private boolean active;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    private ProductEntity product;

    @PrePersist
    protected void onCreate() {
        active = true;
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
}
