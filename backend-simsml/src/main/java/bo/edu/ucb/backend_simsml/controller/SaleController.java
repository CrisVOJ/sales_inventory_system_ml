package bo.edu.ucb.backend_simsml.controller;

import bo.edu.ucb.backend_simsml.config.util.Globals;
import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.sale.CreateSaleRequest;
import bo.edu.ucb.backend_simsml.dto.sale.UpdateSaleRequest;
import bo.edu.ucb.backend_simsml.service.SaleService;
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
@RequestMapping(Globals.baseApi + "sale")
@PreAuthorize("hasRole('ADMIN')")
public class SaleController {

    @Autowired
    private SaleService saleService;

    @PostMapping("/create")
    public ResponseEntity<Object> createSale(@Valid @RequestBody CreateSaleRequest request) {
        try {
            Object response = saleService.createSale(request);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al registrar venta", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<Object> getSales(
            @RequestParam(value = "startDate", required = false) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) LocalDate endDate,
            @PageableDefault(sort = "registrationDate", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        try {
            Object response = saleService.getSales(startDate, endDate, pageable);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al obtener ventas", e.getMessage()));
        }
    }

    @GetMapping("/")
    public ResponseEntity<Object> getSale(@RequestParam("saleId") Long saleId) {
        try {
            Object response = saleService.getSale(saleId);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al obtener venta", e.getMessage()));
        }
    }

    @PutMapping("/update")
    public ResponseEntity<Object> updateSale(@Valid @RequestBody UpdateSaleRequest request) {
        try {
            Object response = saleService.updateSale(request);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al actualizar venta", e.getMessage()));
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
