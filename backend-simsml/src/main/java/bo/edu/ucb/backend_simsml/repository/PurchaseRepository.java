package bo.edu.ucb.backend_simsml.repository;

import bo.edu.ucb.backend_simsml.entity.PurchaseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface PurchaseRepository extends JpaRepository<PurchaseEntity, Long> {

    @Query(value = "SELECT p FROM purchases p " +
            "WHERE " +
            "p.date >= COALESCE(:startDate, p.date) " +
            "AND p.date <= COALESCE(:endDate, p.date) "
    )
    Page<PurchaseEntity> findAllPurchases(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate, Pageable pageable);

}
