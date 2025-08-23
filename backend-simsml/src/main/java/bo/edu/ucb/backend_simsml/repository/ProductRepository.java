package bo.edu.ucb.backend_simsml.repository;

import bo.edu.ucb.backend_simsml.entity.ProductEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<ProductEntity, Long> {

    @Query(value = "SELECT p FROM products p " +
            "WHERE (" +
            ":filter IS NULL OR " +
            "p.name ILIKE %:filter% OR " +
            "p.description ILIKE %:filter% OR " +
            "p.code ILIKE %:filter%) AND " +
            "(:status IS NULL OR p.active = :status)"
    )
    Page<ProductEntity> findAllProducts(@Param("filter") String filter, @Param("status") Boolean status, Pageable pageable);

}
