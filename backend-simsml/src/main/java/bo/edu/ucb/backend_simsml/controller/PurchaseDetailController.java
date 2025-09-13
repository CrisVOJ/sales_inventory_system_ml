package bo.edu.ucb.backend_simsml.controller;

import bo.edu.ucb.backend_simsml.config.util.Globals;
import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.purchaseDetail.CreatePurchaseDetailRequest;
import bo.edu.ucb.backend_simsml.dto.purchaseDetail.UpdatePurchaseDetailRequest;
import bo.edu.ucb.backend_simsml.service.PurchaseDetailService;
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
@RequestMapping(Globals.baseApi + "purchaseDetail")
@PreAuthorize("hasRole('ADMIN')")
public class PurchaseDetailController {

    @Autowired
    private PurchaseDetailService purchaseDetailService;

    @PostMapping("/create")
    public ResponseEntity<Object> createPurchaseDetail(@Valid @RequestBody CreatePurchaseDetailRequest request) {
        try {
            Object response = purchaseDetailService.createPurchaseDetail(request);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al registrar detalle de compra", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<Object> getPurchasesDetails(
            @RequestParam(name = "status", required = false) Boolean status,
            @PageableDefault(sort = "updatedAt", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        try {
            Object response = purchaseDetailService.getPurchasesDetails(status, pageable);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al obtener detalles de compras", e.getMessage()));
        }
    }

    @GetMapping("/")
    public ResponseEntity<Object> getPurchaseDetail(@RequestParam("purchaseDetailId") Long purchaseDetailId) {
        try {
            Object response = purchaseDetailService.getPurchaseDetail(purchaseDetailId);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al obtener detalle de compra", e.getMessage()));
        }
    }

    @PutMapping("/update")
    public ResponseEntity<Object> updatePurchaseDetail(@Valid @RequestBody UpdatePurchaseDetailRequest request) {
        try {
            Object response = purchaseDetailService.updatePurchaseDetail(request);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al actualizar detalle de compra", e.getMessage()));
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
