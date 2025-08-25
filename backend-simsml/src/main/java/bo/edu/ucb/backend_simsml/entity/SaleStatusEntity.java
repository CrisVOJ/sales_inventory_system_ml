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
@Entity(name = "sale_statuses")
@Table(name = "sale_statuses")
public class SaleStatusEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sale_status_id")
    private Long saleStatusId;

    @Column(name = "name")
    private String name;
    @Column(name = "active")
    private boolean active;

    @PrePersist
    protected void onCreate() {
        this.active = true;
    }

}
