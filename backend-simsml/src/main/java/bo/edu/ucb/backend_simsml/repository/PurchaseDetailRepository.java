package bo.edu.ucb.backend_simsml.repository;

import bo.edu.ucb.backend_simsml.entity.PurchaseDetailEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PurchaseDetailRepository extends JpaRepository<PurchaseDetailEntity, Long> {

    @Query(value = "SELECT pd FROM purchases_details pd " +
            "WHERE (:status IS NULL OR pd.active = :status)")
    Page<PurchaseDetailEntity> findAllPurchasesDetails(@Param("status") Boolean status, Pageable pageable);

}
