package bo.edu.ucb.backend_simsml.dto.prediction;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

public record CreatePredictionRequest(@NotNull LocalDateTime predictionDate,
                                      @NotNull @Positive Long estimatedAmount,
                                      @NotNull @DecimalMin("0.0") Double reliability,
                                      @NotNull Long inventoryId) {
}
