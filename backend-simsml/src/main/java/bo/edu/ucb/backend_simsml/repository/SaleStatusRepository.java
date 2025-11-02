package bo.edu.ucb.backend_simsml.repository;

import bo.edu.ucb.backend_simsml.entity.SaleStatusEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SaleStatusRepository extends JpaRepository<SaleStatusEntity, Long> {

    @Query(value = "SELECT s FROM sale_statuses s " +
            "WHERE s.active = true " +
            "ORDER BY s.name ASC"
    )
    List<SaleStatusEntity> findActiveSaleStatus();
}
