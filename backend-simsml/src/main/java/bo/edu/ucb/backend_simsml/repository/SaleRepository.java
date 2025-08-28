package bo.edu.ucb.backend_simsml.repository;

import bo.edu.ucb.backend_simsml.entity.SaleEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface SaleRepository extends JpaRepository<SaleEntity, Long> {

    @Query(value = "SELECT s FROM sales s " +
            "WHERE " +
            "s.registrationDate >= COALESCE(:startDate, s.registrationDate) " +
            "AND s.registrationDate <= COALESCE(:endDate, s.registrationDate) "
    )
    Page<SaleEntity> findAllSales(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate, Pageable pageable);

}
