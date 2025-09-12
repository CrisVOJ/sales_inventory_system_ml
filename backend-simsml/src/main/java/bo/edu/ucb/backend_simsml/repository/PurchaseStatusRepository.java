package bo.edu.ucb.backend_simsml.repository;

import bo.edu.ucb.backend_simsml.entity.PurchaseStatusEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseStatusRepository extends JpaRepository<PurchaseStatusEntity, Long> {
}
