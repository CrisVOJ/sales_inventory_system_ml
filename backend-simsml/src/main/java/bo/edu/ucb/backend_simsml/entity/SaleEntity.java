package bo.edu.ucb.backend_simsml.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity(name = "sales")
@Table(name = "sales")
public class SaleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sale_id")
    private Long saleId;

    @Column(name = "registration_date")
    private LocalDate registrationDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private CustomerEntity customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_status_id", nullable = false)
    private SaleStatusEntity saleStatus;

    @NotNull
    @Column(name = "total", nullable = false, precision = 18, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @OneToMany(
            mappedBy = "sale",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("saleDetailId ASC")
    private List<SaleDetailEntity> saleDetails = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void addDetail(SaleDetailEntity saleDetail) {
        saleDetail.setSale(this);
        this.saleDetails.add(saleDetail);
        if (saleDetail.getSubtotal() != null) {
            this.total = this.total.add(saleDetail.getSubtotal());
        }
    }

    public void removeDetail(SaleDetailEntity saleDetail) {
        this.saleDetails.remove(saleDetail);
        saleDetail.setSale(null);
        if (saleDetail.getSubtotal() != null) {
            this.total = this.total.subtract(saleDetail.getSubtotal());
        }
    }

    public void recomputeTotal() {
        this.total = this.saleDetails.stream()
                .map(SaleDetailEntity::getSubtotal)
                .filter(s -> s != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (registrationDate == null) {
            registrationDate = LocalDate.now();
        }
        recomputeTotal();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        recomputeTotal();
    }
}
