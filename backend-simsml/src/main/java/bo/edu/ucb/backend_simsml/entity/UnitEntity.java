package bo.edu.ucb.backend_simsml.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity(name = "units")
@Table(name = "units")
public class UnitEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "unit_id")
    private Long unitId;

    @Column(name = "name", nullable = false, unique = true)
    private String name;
    @Column(name = "active")
    private boolean active;

    @PrePersist
    protected void onCreate() {
        active = true;
    }
}
