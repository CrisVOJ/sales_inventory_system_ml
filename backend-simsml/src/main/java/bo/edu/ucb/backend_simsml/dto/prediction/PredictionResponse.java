package bo.edu.ucb.backend_simsml.dto.prediction;

import bo.edu.ucb.backend_simsml.dto.inventory.InventorySummary;
import bo.edu.ucb.backend_simsml.dto.product.ProductSummary;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PredictionResponse(
        Long predictionId,
        LocalDateTime predictionDate,
        Long estimatedAmount,
        Double reliability,
        LocalDateTime generationDate,
        InventorySummary inventory,
        boolean active
) {
}
