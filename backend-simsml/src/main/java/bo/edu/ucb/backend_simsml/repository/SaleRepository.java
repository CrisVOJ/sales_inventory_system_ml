package bo.edu.ucb.backend_simsml.repository;

import bo.edu.ucb.backend_simsml.entity.SaleEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface SaleRepository extends JpaRepository<SaleEntity, Long> {

    @EntityGraph(attributePaths = {"user", "customer", "saleStatus"})
    Page<SaleEntity> findByRegistrationDateBetween(LocalDate start, LocalDate end, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "customer", "saleStatus"})
    @Query(value = "SELECT s FROM sales s " +
            "WHERE " +
            "s.registrationDate >= COALESCE(:startDate, s.registrationDate) " +
            "AND s.registrationDate <= COALESCE(:endDate, s.registrationDate) "
    )
    Page<SaleEntity> findAllSales(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "customer", "saleStatus", "saleDetails", "saleDetails.inventory"})
    @Query("SELECT s FROM sales s WHERE s.saleId = :saleId")
    Optional<SaleEntity> findOneWithDetails(@Param("saleId") Long saleId);

    @Query(value = "" +
            "SELECT new map(" +
            "FUNCTION('to_char', s.registrationDate, 'YYYY-MM') as month, " +
            "SUM (sd.productQuantity) as quantity" +
            ") " +
            "FROM sales_details sd " +
            "JOIN sd.sale s " +
            "WHERE sd.inventory.inventoryId = :inventoryId " +
            "AND s.saleStatus.name <> 'ANULADO' " +
            "GROUP BY FUNCTION('to_char', s.registrationDate, 'YYYY-MM') " +
            "ORDER BY FUNCTION('to_char', s.registrationDate, 'YYYY-MM')"
    )
    List<Map<String, Object>> findMonthlyDemandByInventory(@Param("inventoryId") Long inventoryId);
}
