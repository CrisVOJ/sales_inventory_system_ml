package bo.edu.ucb.backend_simsml.repository;

import bo.edu.ucb.backend_simsml.entity.InventoryEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<InventoryEntity, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM inventories i " +
            "WHERE i.inventoryId = :inventoryId"
    )
    Optional<InventoryEntity> lockById(@Param("inventoryId") Long inventoryId);

    @Query(value = "SELECT i FROM inventories i " +
            "WHERE " +
            "(:status IS NULL OR i.active = :status)")
    Page<InventoryEntity> findAllInventories(@Param("status") Boolean status, Pageable pageable);

    @Query(value = "SELECT i FROM inventories i " +
            "WHERE i.active = true AND i.location.locationId = :locationId " +
            "ORDER BY i.product.name ASC"
    )
    List<InventoryEntity> findInventoriesByLocation(@Param("locationId") Long locationId);
}
