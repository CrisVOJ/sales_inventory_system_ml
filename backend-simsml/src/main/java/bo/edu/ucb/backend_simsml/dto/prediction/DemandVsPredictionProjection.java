package bo.edu.ucb.backend_simsml.dto.prediction;

import java.math.BigDecimal;

public interface DemandVsPredictionProjection {
    String getMonthlabel();
    BigDecimal getPrediction();;
    Long getDemand();
}
