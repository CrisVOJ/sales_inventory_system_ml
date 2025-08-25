package bo.edu.ucb.backend_simsml.controller;

import bo.edu.ucb.backend_simsml.config.util.Globals;
import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.inventory.CreateInventoryRequest;
import bo.edu.ucb.backend_simsml.dto.inventory.UpdateInventoryRequest;
import bo.edu.ucb.backend_simsml.service.InventoryService;
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
@RequestMapping(Globals.baseApi + "inventory")
@PreAuthorize("hasRole('ADMIN')")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @PostMapping("/create")
    public ResponseEntity<Object> createInventory(@Valid @RequestBody CreateInventoryRequest request) {
        try {
            Object response = inventoryService.createInventory(request);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al crear inventario", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<Object> getInventories(
            @RequestParam(value = "status", required = false) Boolean status,
            @PageableDefault(sort = "updatedAt", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        try {
            Object response = inventoryService.getInventories(status, pageable);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al obtener inventarios", e.getMessage()));
        }
    }

    @GetMapping("/")
    public ResponseEntity<Object> getInventory(@RequestParam("inventoryId") Long inventoryId) {
        try {
            Object response = inventoryService.getInventory(inventoryId);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al obtener inventario", e.getMessage()));
        }
    }

    @PutMapping("/update")
    public ResponseEntity<Object> updateInventory(@Valid @RequestBody UpdateInventoryRequest request) {
        try {
            Object response = inventoryService.updateInventory(request);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al actualizar inventario", e.getMessage()));
        }
    }

    @PutMapping("/disable")
    public ResponseEntity<Object> disableInventory(@RequestParam("inventoryId") Long inventoryId) {
        try {
            Object response = inventoryService.disableInventory(inventoryId);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al eliminar inventario", e.getMessage()));
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
