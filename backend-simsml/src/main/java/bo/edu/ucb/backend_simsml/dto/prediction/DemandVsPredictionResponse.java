package bo.edu.ucb.backend_simsml.dto.prediction;

import java.math.BigDecimal;

public record DemandVsPredictionResponse(
        String monthLabel,
        BigDecimal prediction,
        Long demand
) {
}