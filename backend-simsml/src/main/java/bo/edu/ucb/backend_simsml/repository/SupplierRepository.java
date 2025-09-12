package bo.edu.ucb.backend_simsml.repository;

import bo.edu.ucb.backend_simsml.entity.SupplierEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SupplierRepository extends JpaRepository<SupplierEntity, Long> {

    @Query(value = "SELECT s FROM suppliers s " +
            "WHERE (" +
            ":filter IS NULL OR " +
            "s.name ILIKE %:filter% OR " +
            "s.contact ILIKE %:filter% OR " +
            "s.email ILIKE %:filter% OR " +
            "s.phone ILIKE %:filter% OR " +
            "s.address ILIKE %:filter%) AND " +
            "(:status IS NULL OR " +
            "s.active = :status)"
    )
    Page<SupplierEntity> findAllSuppliers(@Param("filter") String filter, @Param("status") Boolean status, Pageable pageable);

}
