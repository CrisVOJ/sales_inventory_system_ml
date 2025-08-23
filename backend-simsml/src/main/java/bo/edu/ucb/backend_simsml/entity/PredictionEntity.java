package bo.edu.ucb.backend_simsml.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
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

    @Column(name = "prediction_date")
    private LocalDateTime predictionDate;
    @Column(name = "estimated_amount")
    private Long estimatedAmount;
    @Column(name = "reliability")
    private Double reliability;
    @Column(name = "generation_date")
    private LocalDateTime generationDate;

    @Column(name = "active")
    private boolean active;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    private ProductEntity product;

    @PrePersist
    protected void onCreate() {
        active = true;
        generationDate = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

}
