package bo.edu.ucb.backend_simsml.dto.prediction;

import java.util.List;

public record MlForecastResponse(
        Long inventoryId,
        List<MlForecastItem> forecasts
) {
}
