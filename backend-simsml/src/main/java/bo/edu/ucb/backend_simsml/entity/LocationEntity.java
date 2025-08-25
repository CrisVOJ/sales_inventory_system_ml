package bo.edu.ucb.backend_simsml.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity(name = "locations")
@Table(name = "locations")
public class LocationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "location_id")
    private Long locationId;

    @Column(name = "code")
    private String code;
    @Column(name = "name")
    private String name;
    @Column(name = "active")
    private boolean active;

}
