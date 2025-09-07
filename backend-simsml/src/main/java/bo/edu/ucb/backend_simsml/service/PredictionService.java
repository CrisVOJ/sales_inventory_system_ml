package bo.edu.ucb.backend_simsml.service;

import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.inventory.InventorySummary;
import bo.edu.ucb.backend_simsml.dto.prediction.CreatePredictionRequest;
import bo.edu.ucb.backend_simsml.dto.prediction.PredictionResponse;
import bo.edu.ucb.backend_simsml.dto.product.ProductSummary;
import bo.edu.ucb.backend_simsml.entity.InventoryEntity;
import bo.edu.ucb.backend_simsml.entity.PredictionEntity;
import bo.edu.ucb.backend_simsml.entity.ProductEntity;
import bo.edu.ucb.backend_simsml.repository.InventoryRepository;
import bo.edu.ucb.backend_simsml.repository.PredictionRepository;
import bo.edu.ucb.backend_simsml.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PredictionService {

    @Autowired
    private PredictionRepository predictionRepository;
    @Autowired
    private InventoryRepository inventoryRepository;

    public Object createPrediction(CreatePredictionRequest request) {
        try {
            InventoryEntity inventory = inventoryRepository.findById(request.inventoryId())
                    .orElse(null);

            if (inventory == null) {
                return new UnsuccessfulResponse("404", "No se pudo encontrar el producto", null);
            }

            PredictionEntity prediction = new PredictionEntity();
            prediction.setEstimatedAmount(request.estimatedAmount());
            prediction.setReliability(request.reliability());
            prediction.setInventory(inventory);

            predictionRepository.save(prediction);
            return new SuccessfulResponse("201", "Predicción registrada exitosamente", prediction.getPredictionId());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al registrar la prediccion", e.getMessage());
        }
    }

    public Object getPredictions(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        try {
            Page<PredictionResponse> predictions = predictionRepository.findAllPredictions(startDate, endDate, pageable)
                    .map(predictionResponse -> new PredictionResponse(
                            predictionResponse.getPredictionId(),
                            predictionResponse.getPredictionDate(),
                            predictionResponse.getEstimatedAmount(),
                            predictionResponse.getReliability(),
                            predictionResponse.getGenerationDate(),
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

}
