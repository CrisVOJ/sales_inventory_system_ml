package bo.edu.ucb.backend_simsml.repository;

import bo.edu.ucb.backend_simsml.entity.PaymentMethodEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentMethodRepository extends JpaRepository<PaymentMethodEntity, Long> {
}
