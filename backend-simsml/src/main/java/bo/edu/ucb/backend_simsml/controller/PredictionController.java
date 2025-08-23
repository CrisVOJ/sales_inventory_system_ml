package bo.edu.ucb.backend_simsml.controller;

import bo.edu.ucb.backend_simsml.config.util.Globals;
import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.prediction.CreatePredictionRequest;
import bo.edu.ucb.backend_simsml.service.PredictionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping(Globals.baseApi + "prediction")
@PreAuthorize("hasRole('ADMIN')")
public class PredictionController {

    @Autowired
    private PredictionService predictionService;

    @PostMapping("/create")
    public ResponseEntity<Object> createPrediction(@Valid @RequestBody CreatePredictionRequest request) {
        try {
            Object response = predictionService.createPrediction(request);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al registrar predicción", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<Object> getPredictions(
            @RequestParam(value = "startDate", required = false) LocalDateTime startDate,
            @RequestParam(value = "endDate", required = false) LocalDateTime endDate,
            @PageableDefault(sort = "generationDate", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        try {
            Object response = predictionService.getPredictions(startDate, endDate, pageable);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al obtener predicciones", e.getMessage()));
        }
    }

    private ResponseEntity<Object> generateResponse(Object response) {
        if (response instanceof SuccessfulResponse) {
            return ResponseEntity.ok(response);
        } else if (response instanceof UnsuccessfulResponse) {
            return ResponseEntity.status(Integer.parseInt(((UnsuccessfulResponse) response).getStatus()))
                    .body(response);
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
