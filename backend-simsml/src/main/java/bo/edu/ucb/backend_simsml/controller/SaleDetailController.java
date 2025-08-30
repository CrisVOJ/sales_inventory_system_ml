package bo.edu.ucb.backend_simsml.controller;

import bo.edu.ucb.backend_simsml.config.util.Globals;
import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.saleDetail.CreateSaleDetailRequest;
import bo.edu.ucb.backend_simsml.dto.saleDetail.UpdateSaleDetailRequest;
import bo.edu.ucb.backend_simsml.service.SaleDetailService;
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
@RequestMapping(Globals.baseApi + "saleDetail")
@PreAuthorize("hasRole('ADMIN')")
public class SaleDetailController {

    @Autowired
    private SaleDetailService saleDetailService;

    @PostMapping("/create")
    public ResponseEntity<Object> createSaleDetail(@Valid @RequestBody CreateSaleDetailRequest request) {
        try {
            Object response = saleDetailService.createSaleDetail(request);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al registrar detalle de venta", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<Object> getSalesDetails(
            @RequestParam(name = "status", required = false) Boolean status,
            @PageableDefault(sort = "updatedAt", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        try {
            Object response = saleDetailService.getSalesDetails(status, pageable);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al obtener detalles de ventas", e.getMessage()));
        }
    }

    @GetMapping("/")
    public ResponseEntity<Object> getSaleDetail(@RequestParam("saleDetailId") Long saleDetailId) {
        try {
            Object response = saleDetailService.getSaleDetail(saleDetailId);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al obtener detalle de venta", e.getMessage()));
        }
    }

    @PutMapping("/update")
    public ResponseEntity<Object> updateSaleDetail(@Valid @RequestBody UpdateSaleDetailRequest request) {
        try {
            Object response = saleDetailService.updateSaleDetail(request);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al modificar detalle de venta", e.getMessage()));
        }
    }

    @PutMapping("/disable")
    public ResponseEntity<Object> disableSaleDetail(@RequestParam("saleDetailId") Long saleDetailId) {
        try {
            Object response = saleDetailService.disableSaleDetail(saleDetailId);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al eliminar detalle de venta", e.getMessage()));
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
