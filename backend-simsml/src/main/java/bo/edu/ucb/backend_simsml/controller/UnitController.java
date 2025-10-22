package bo.edu.ucb.backend_simsml.controller;

import bo.edu.ucb.backend_simsml.config.util.Globals;
import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.unit.CreateUnitRequest;
import bo.edu.ucb.backend_simsml.dto.unit.UpdateUnitRequest;
import bo.edu.ucb.backend_simsml.service.UnitService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(Globals.baseApi + "unit")
@PreAuthorize("hasRole('ADMIN')")
public class UnitController {

    @Autowired
    private UnitService unitService;

    @PostMapping("/create")
    public ResponseEntity<Object> createUnit(@Valid @RequestBody CreateUnitRequest unitRequest) {
        try {
            Object response = unitService.createUnit(unitRequest);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al crear unidad", e.getMessage()));
        }
    }

    @PutMapping("/update")
    public ResponseEntity<Object> updateUnit(@Valid @RequestBody UpdateUnitRequest request) {
        try {
            Object response = unitService.updateUnit(request);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al actualizar unidad", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<Object> getUnits(
            @RequestParam(value = "filter", required = false) String filter,
            @RequestParam(value = "status", required = false) Boolean status
    ) {
        try {
            Object response = unitService.getUnits(filter, status);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al obtener unidades", e.getMessage()));
        }
    }

    @GetMapping("/")
    public ResponseEntity<Object> getUnit(@RequestParam("unitId") Long unitId) {
        try {
            Object response = unitService.getUnitById(unitId);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al obtener unidad", e.getMessage()));
        }
    }

    @DeleteMapping("/disable")
    public ResponseEntity<Object> disableUnit(@RequestParam("unitId") Long unitId) {
        try {
            Object response = unitService.disableUnit(unitId);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al deshabilitar unidad", e.getMessage()));
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
