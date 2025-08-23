package bo.edu.ucb.backend_simsml.repository;

import bo.edu.ucb.backend_simsml.entity.PredictionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface PredictionRepository extends JpaRepository<PredictionEntity, Long> {

    @Query(value = "SELECT p FROM predictions p " +
            "WHERE " +
            "p.generationDate >= COALESCE(:startDate, p.generationDate) " +
            "AND p.generationDate <= COALESCE(:endDate,   p.generationDate)"
    )
    Page<PredictionEntity> findAllPredictions(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

}
