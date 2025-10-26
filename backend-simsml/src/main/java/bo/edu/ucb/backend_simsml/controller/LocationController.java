package bo.edu.ucb.backend_simsml.controller;

import bo.edu.ucb.backend_simsml.config.util.Globals;
import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.category.UpdateCategoryRequest;
import bo.edu.ucb.backend_simsml.dto.location.CreateLocationRequest;
import bo.edu.ucb.backend_simsml.dto.location.UpdateLocationRequest;
import bo.edu.ucb.backend_simsml.service.LocationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(Globals.baseApi + "location")
@PreAuthorize("hasRole('ADMIN')")
public class LocationController {

    @Autowired
    private LocationService locationService;

    @PostMapping("/create")
    public ResponseEntity<Object> createLocation(@Valid @RequestBody CreateLocationRequest request) {
        try {
            Object response = locationService.createLocation(request);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al crear ubicación", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<Object> getLocations(
            @RequestParam(value = "filter", required = false) String filter,
            @RequestParam(value = "status", required = false) Boolean status,
            @PageableDefault(sort = "updatedAt", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        try {
            Object response = locationService.getLocations(filter, status, pageable);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al obtener ubicaciones", e.getMessage()));
        }
    }

    @GetMapping("/allSummary")
    public ResponseEntity<Object> getLocationsSummary() {
        try {
            Object response = locationService.getLocationsSummary();
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al obtener resumen de ubicaciones", e.getMessage()));
        }
    }

    @GetMapping("/")
    public ResponseEntity<Object> getLocation(@RequestParam("locationId") Long locationId) {
        try {
            Object response = locationService.getLocationById(locationId);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al obtener ubicaciones", e.getMessage()));
        }
    }

    @PutMapping("/update")
    public ResponseEntity<Object> updateLocation(@Valid @RequestBody UpdateLocationRequest request) {
        try {
            Object response = locationService.updateLocation(request);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al actualizar ubicación", e.getMessage()));
        }
    }

    @DeleteMapping("/disable")
    public ResponseEntity<Object> disableLocation(@RequestParam("locationId") Long locationId) {
        try {
            Object response = locationService.disableLocation(locationId);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al deshabilitar ubicación", e.getMessage()));
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
