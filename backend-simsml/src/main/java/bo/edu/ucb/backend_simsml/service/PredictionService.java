package bo.edu.ucb.backend_simsml.service;

import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.inventory.InventorySummary;
import bo.edu.ucb.backend_simsml.dto.prediction.CreatePredictionRequest;
import bo.edu.ucb.backend_simsml.dto.prediction.MlForecastItem;
import bo.edu.ucb.backend_simsml.dto.prediction.MlForecastResponse;
import bo.edu.ucb.backend_simsml.dto.prediction.PredictionResponse;
import bo.edu.ucb.backend_simsml.entity.InventoryEntity;
import bo.edu.ucb.backend_simsml.entity.PredictionEntity;
import bo.edu.ucb.backend_simsml.repository.InventoryRepository;
import bo.edu.ucb.backend_simsml.repository.PredictionRepository;
import bo.edu.ucb.backend_simsml.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PredictionService {

    private final WebClient webClient;

    public PredictionService(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("http://localhost:8000").build();
    }

    @Autowired
    private PredictionRepository predictionRepository;
    @Autowired
    private InventoryRepository inventoryRepository;
    @Autowired
    private SaleRepository saleRepository;

    @Transactional(noRollbackFor = Exception.class)
    public Object createPrediction(CreatePredictionRequest request) {
        try {
            InventoryEntity inventory = inventoryRepository.findById(request.inventory())
                    .orElse(null);

            if (inventory == null) {
                return new UnsuccessfulResponse("404", "No se pudo encontrar el producto", null);
            }

            List<Map<String, Object>> monthlyData = saleRepository.findMonthlyDemandByInventory(request.inventory());

            if (monthlyData.isEmpty()) {
                return new UnsuccessfulResponse("404", "No hay datos de ventas para el inventario especificado", null);
            }

            MlForecastResponse mlResponse = predictDemand(request.inventory(), monthlyData, request.months());

            if (mlResponse == null || mlResponse.forecasts() == null || mlResponse.forecasts().isEmpty()) {
                return new UnsuccessfulResponse("500", "Error al obtener la predicción del modelo de ML", null);
            }

            List<Long> savedPredictionIds = new ArrayList<>();

            for (MlForecastItem item : mlResponse.forecasts()) {
                LocalDate targetMonth = LocalDate.parse(item.month() + "-01");

                List<PredictionEntity> duplicates = predictionRepository.findActiveByInventoryAndTargetMonth(
                        request.inventory(),
                        targetMonth
                );

                for (PredictionEntity old : duplicates) {
                    old.setActive(false);
                    predictionRepository.save(old);
                }

                predictionRepository.flush();

                PredictionEntity prediction = new PredictionEntity();
                prediction.setEstimatedAmount(item.predictedQuantity());
                prediction.setReliability(item.reliability());
                prediction.setInventory(inventory);
                prediction.setTargetMonth(targetMonth);
                prediction.setActive(true);

                predictionRepository.save(prediction);
                savedPredictionIds.add(prediction.getPredictionId());
            }

            return new SuccessfulResponse("201", "Predicciones registradas exitosamente", savedPredictionIds);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al registrar la prediccion", e.getMessage());
        }
    }

    public Object getPredictions(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        try {
            Page<PredictionResponse> predictions = predictionRepository.findAllPredictions(startDate, endDate, pageable)
                    .map(predictionResponse -> new PredictionResponse(
                            predictionResponse.getPredictionId(),
                            predictionResponse.getEstimatedAmount(),
                            predictionResponse.getReliability(),
                            predictionResponse.getTargetMonth(),
                            InventorySummary.from(predictionResponse.getInventory()),
                            predictionResponse.isActive()
                    ));

            if (!predictions.isEmpty()) {
                return new SuccessfulResponse("200", "Predicciones obtenidas exitosamente", predictions);
            }

            return new UnsuccessfulResponse("404", "No se encontraron predicciones registradas", null);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al obtener predicciones", e.getMessage());
        }
    }

    public MlForecastResponse predictDemand(Long inventoryId, List<Map<String, Object>> monthlyData, int months) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("inventory_id", inventoryId);
        payload.put("data", monthlyData);
        payload.put("months", months);

        return webClient.post()
                .uri("/predict/demand")
                .bodyValue(payload)
                .retrieve()
                .bodyToMono(MlForecastResponse.class)
                .block();
    }
}
