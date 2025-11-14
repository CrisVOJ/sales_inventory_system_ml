package bo.edu.ucb.backend_simsml.dto.prediction;

public record MlForecastItem(
        String month,
        Long predictedQuantity,
        Double reliability
) {
}
