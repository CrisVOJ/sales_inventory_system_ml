package bo.edu.ucb.backend_simsml.repository;

import bo.edu.ucb.backend_simsml.entity.PaymentEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> {

    @Query(value = "SELECT p FROM payments p " +
            "WHERE " +
            "p.date >= COALESCE(:startDate, p.date) " +
            "AND p.date <= COALESCE(:endDate, p.date) " +
            "AND (:status IS NULL OR p.active = :status)"
    )
    Page<PaymentEntity> findAllPayments(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate, @Param("status") Boolean status, Pageable pageable);

}
