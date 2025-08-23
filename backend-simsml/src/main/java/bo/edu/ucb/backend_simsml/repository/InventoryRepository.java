package bo.edu.ucb.backend_simsml.repository;

import bo.edu.ucb.backend_simsml.entity.InventoryEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InventoryRepository extends JpaRepository<InventoryEntity, Long> {

    @Query(value = "SELECT i FROM inventories i " +
            "WHERE (" +
            ":filter IS NULL OR " +
            "i.location ILIKE %:filter%) AND " +
            "(:status IS NULL OR i.active = :status)")
    Page<InventoryEntity> findAllInventories(@Param("filter") String filter, @Param("status") Boolean status, Pageable pageable);

}
