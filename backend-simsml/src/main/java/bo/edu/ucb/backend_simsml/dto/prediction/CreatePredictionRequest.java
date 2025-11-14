package bo.edu.ucb.backend_simsml.dto.prediction;

import jakarta.validation.constraints.NotNull;

public record CreatePredictionRequest(
        @NotNull Long inventory,
        @NotNull Integer months
) {
}
