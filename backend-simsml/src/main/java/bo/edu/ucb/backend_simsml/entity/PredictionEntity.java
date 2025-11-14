package bo.edu.ucb.backend_simsml.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity(name = "predictions")
@Table(name = "predictions")
public class PredictionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "prediction_id")
    private Long predictionId;

    @Column(name = "estimated_amount")
    private Long estimatedAmount;
    @Column(name = "reliability")
    private Double reliability;
    @Column(name = "target_month", nullable = false)
    private LocalDate targetMonth;

    @Column(name = "active")
    private boolean active = true;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    private InventoryEntity inventory;

    @PrePersist
    protected void onCreate() {
        active = true;
        createdAt = LocalDateTime.now();
    }

}
