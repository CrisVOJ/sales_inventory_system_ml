package bo.edu.ucb.backend_simsml.repository;

import bo.edu.ucb.backend_simsml.entity.CustomerEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CustomerRepository extends JpaRepository<CustomerEntity, Long> {

    @Query(value = "SELECT c FROM customers c " +
            "WHERE (" +
            ":filter IS NULL OR " +
            "c.identityDocument ILIKE %:filter% OR " +
            "c.name ILIKE %:filter% OR " +
            "c.paternalSurname ILIKE %:filter% OR " +
            "c.maternalSurname ILIKE %:filter%) AND " +
            "(:status IS NULL OR c.active = :status)"
    )
    Page<CustomerEntity> findAllCustomers(@Param("filter") String filter, @Param("status") Boolean status, Pageable pageable);

    @Query(value = "SELECT c FROM customers c " +
            "WHERE (" +
            "c.active = true ) " +
            "ORDER BY c.name ASC, c.paternalSurname ASC, c.maternalSurname ASC"
    )
    List<CustomerEntity> findAllCustomersSummary();

}
