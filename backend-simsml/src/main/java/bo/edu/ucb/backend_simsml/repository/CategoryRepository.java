package bo.edu.ucb.backend_simsml.repository;

import bo.edu.ucb.backend_simsml.entity.CategoryEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CategoryRepository extends JpaRepository<CategoryEntity, Long> {

    @Query(value = "SELECT c FROM categories c " +
            "WHERE (" +
            ":filter IS NULL OR " +
            "c.name ILIKE %:filter% OR " +
            "c.description ILIKE %:filter%) AND " +
            "(:status IS NULL OR c.active = :status)"
    )
    Page<CategoryEntity> findAllCategories(@Param("filter") String filter, @Param("status") Boolean status, Pageable pageable);

}
