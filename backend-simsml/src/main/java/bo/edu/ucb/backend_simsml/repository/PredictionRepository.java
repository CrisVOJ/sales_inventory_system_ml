package bo.edu.ucb.backend_simsml.repository;

import bo.edu.ucb.backend_simsml.entity.PredictionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface PredictionRepository extends JpaRepository<PredictionEntity, Long> {

    @Query(value = "SELECT p FROM predictions p " +
            "WHERE " +
            "p.targetMonth >= COALESCE(:startDate, p.targetMonth) " +
            "AND p.targetMonth <= COALESCE(:endDate,   p.targetMonth)"
    )
    Page<PredictionEntity> findAllPredictions(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate, Pageable pageable);

    @Query(value = "SELECT p FROM predictions p " +
            "WHERE p.inventory.inventoryId = :inventoryId " +
            "AND p.targetMonth = :targetMonth " +
            "AND p.active = true"
    )
    List<PredictionEntity> findActiveByInventoryAndTargetMonth(@Param("inventoryId") Long inventoryId, @Param("targetMonth") LocalDate targetMonth);

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
