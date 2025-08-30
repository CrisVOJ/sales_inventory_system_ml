package bo.edu.ucb.backend_simsml.repository;

import bo.edu.ucb.backend_simsml.entity.SaleDetailEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SaleDetailRepository extends JpaRepository<SaleDetailEntity, Long> {

    @Query(value = "SELECT sd FROM sales_details sd " +
            "WHERE (:status IS NULL OR sd.active = :status)")
    Page<SaleDetailEntity> findAllSalesDetails(@Param("status") Boolean status, Pageable pageable);

}
