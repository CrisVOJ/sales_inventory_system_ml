package bo.edu.ucb.backend_simsml.repository;

import bo.edu.ucb.backend_simsml.dto.prediction.DemandVsPredictionProjection;
import bo.edu.ucb.backend_simsml.dto.prediction.DemandVsPredictionResponse;
import bo.edu.ucb.backend_simsml.entity.PredictionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PredictionRepository extends JpaRepository<PredictionEntity, Long> {

    @Query(value = "SELECT p FROM predictions p " +
            "WHERE " +
            "p.targetMonth >= COALESCE(:startDate, p.targetMonth) " +
            "AND p.targetMonth <= COALESCE(:endDate,   p.targetMonth) " +
            "AND p.active = true"
    )
    Page<PredictionEntity> findAllPredictions(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate, Pageable pageable);

    @Query(value = "SELECT p FROM predictions p " +
            "WHERE p.inventory.inventoryId = :inventoryId " +
            "AND p.targetMonth = :targetMonth " +
            "AND p.active = true"
    )
    List<PredictionEntity> findActiveByInventoryAndTargetMonth(@Param("inventoryId") Long inventoryId, @Param("targetMonth") LocalDate targetMonth);

    @Query(value = "SELECT COALESCE(SUM(p.estimatedAmount), 0) FROM predictions p " +
            "WHERE p.inventory.inventoryId = :inventoryId " +
            "AND p.targetMonth BETWEEN :startDate AND :endDate " +
            "AND p.active = true")
    Long sumEstimatedAmountByInventoryAndRange(@Param("inventoryId") Long inventoryId,
                                               @Param("startDate") LocalDate startDate,
                                               @Param("endDate") LocalDate endDate);

    @Query(value = """
            WITH bounds AS (
                SELECT
                    COALESCE(:startDate,
                             date_trunc('year', CURRENT_DATE)::date) AS start_date,
                    COALESCE(:endDate,
                             (date_trunc('year', CURRENT_DATE) + INTERVAL '1 year - 1 day')::date) AS end_date
            ),
            pred_month AS (
                SELECT
                    date_trunc('month', p.target_month)::date AS month_key,
                    SUM(p.estimated_amount)                  AS prediction
                FROM predictions p, bounds b
                WHERE p.inventory_inventory_id = :inventoryId
                  AND p.active = true
                  AND p.target_month::date BETWEEN b.start_date AND b.end_date
                GROUP BY date_trunc('month', p.target_month)::date
            ),
            sales_month AS (
                SELECT
                    date_trunc('month', s.registration_date)::date AS month_key,
                    SUM(sd.product_quantity)                       AS demand
                FROM sales_details sd
                JOIN sales s
                    ON s.sale_id = sd.sale_id
                JOIN bounds b
                    ON s.registration_date::date BETWEEN b.start_date AND b.end_date
                WHERE sd.inventory_id = :inventoryId
                GROUP BY date_trunc('month', s.registration_date)::date
            )
            SELECT
                to_char(COALESCE(pm.month_key, sm.month_key), 'MM/YYYY') AS monthLabel,
                COALESCE(pm.prediction, 0)                               AS prediction,
                COALESCE(sm.demand, 0)                                   AS demand
            FROM pred_month pm
            FULL OUTER JOIN sales_month sm
                ON sm.month_key = pm.month_key
            ORDER BY COALESCE(pm.month_key, sm.month_key) ASC
            """,
            nativeQuery = true
    )
    List<DemandVsPredictionProjection> findDemandVsPredictionByInventory(
            @Param("inventoryId") Long inventoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Transactional
    @Modifying
    @Query(value = "UPDATE predictions p " +
            "SET p.active = false " +
            "WHERE p.inventory.inventoryId = :inventoryId " +
            "AND p.targetMonth = :targetMonth " +
            "AND p.active = true"
    )
    void deactivateDuplicates(@Param("inventoryId") Long inventoryId, @Param("targetMonth") LocalDate targetMonth);
}
