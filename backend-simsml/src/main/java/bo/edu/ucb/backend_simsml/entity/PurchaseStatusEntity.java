package bo.edu.ucb.backend_simsml.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity(name = "purchase_statuses")
@Table(name = "purchase_statuses")
public class PurchaseStatusEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "purchase_status_id")
    private Long purchaseStatusId;

    @Column(name = "name", unique = true)
    private String name;
    @Column(name = "active")
    private boolean active;

    @PrePersist
    protected void onCreate() {
        this.active = true;
    }

}
