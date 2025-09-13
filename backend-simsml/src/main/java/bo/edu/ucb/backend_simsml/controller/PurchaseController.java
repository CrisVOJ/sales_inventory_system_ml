package bo.edu.ucb.backend_simsml.controller;

import bo.edu.ucb.backend_simsml.config.util.Globals;
import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.purchase.CreatePurchaseRequest;
import bo.edu.ucb.backend_simsml.dto.purchase.UpdatePurchaseRequest;
import bo.edu.ucb.backend_simsml.service.PurchaseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping(Globals.baseApi + "purchase")
@PreAuthorize("hasRole('ADMIN')")
public class PurchaseController {

    @Autowired
    private PurchaseService purchaseService;

    @PostMapping("/create")
    public ResponseEntity<Object> createPurchase(@Valid @RequestBody CreatePurchaseRequest request) {
        try {
            Object response = purchaseService.createPurchase(request);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al registrar compra", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<Object> getPurchases(
            @RequestParam(value = "startDate", required = false) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) LocalDate endDate,
            @PageableDefault(sort = "date", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        try {
            Object response = purchaseService.getPurchases(startDate, endDate, pageable);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al obtener compras", e.getMessage()));
        }
    }

    @GetMapping("/")
    public ResponseEntity<Object> getPurchase(@RequestParam("purchaseId") Long purchaseId) {
        try {
            Object response = purchaseService.getPurchase(purchaseId);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al obtener compra", e.getMessage()));
        }
    }

    @PutMapping("/update")
    public ResponseEntity<Object> updatePurchase(@Valid @RequestBody UpdatePurchaseRequest request) {
        try {
            Object response = purchaseService.updatePurchase(request);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al actualizar compra", e.getMessage()));
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
