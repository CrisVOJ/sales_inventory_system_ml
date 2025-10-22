package bo.edu.ucb.backend_simsml.repository;

import bo.edu.ucb.backend_simsml.entity.UnitEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UnitRepository extends JpaRepository<UnitEntity, Long> {

    @Query(value = "SELECT u FROM units u " +
            "WHERE (" +
            ":filter IS NULL OR " +
            "u.name ILIKE %:filter%) AND " +
            "(:status IS NULL OR u.active = :status)"
    )
    List<UnitEntity> findAllUnits(@Param("filter") String filter, @Param("status") Boolean status);
}
