package bo.edu.ucb.backend_simsml.repository;

import bo.edu.ucb.backend_simsml.entity.LocationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocationRepository extends JpaRepository<LocationEntity, Long> {
}
