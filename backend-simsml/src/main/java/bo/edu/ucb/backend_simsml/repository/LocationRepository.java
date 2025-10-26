package bo.edu.ucb.backend_simsml.repository;

import bo.edu.ucb.backend_simsml.entity.LocationEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LocationRepository extends JpaRepository<LocationEntity, Long> {

    @Query(value = "SELECT l FROM locations l " +
            "WHERE (" +
            ":filter IS NULL OR " +
            "l.code ILIKE %:filter% OR " +
            "l.name ILIKE %:filter%) AND " +
            "(:status IS NULL OR l.active = :status)"
    )
    Page<LocationEntity> findAllLocations(@Param("filter") String filter, @Param("status") Boolean status, Pageable pageable);

    @Query(value = "SELECT l FROM locations l " +
            "WHERE l.active = true " +
            "ORDER BY l.name ASC")
    List<LocationEntity> findAllLocationSummary();

}
