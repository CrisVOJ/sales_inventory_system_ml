package bo.edu.ucb.backend_simsml.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity(name = "products")
@Table(name = "products")
public class ProductEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long productId;

    @Column(name = "name", nullable = false)
    private String name;
    @Column(name = "description")
    private String description;
    @Column(name = "code", nullable = false)
    private String code;
    @Column(name = "suggested_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal suggestedPrice;

    @Column(name = "active")
    private boolean active;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinTable(
            name = "products_categories",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<CategoryEntity> categories = new HashSet<>();
    @ManyToOne(fetch = FetchType.LAZY)
    private UnitEntity unit;

    @PrePersist
    protected void onCreate() {
        active = true;
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

}
