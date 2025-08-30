package bo.edu.ucb.backend_simsml.controller;

import bo.edu.ucb.backend_simsml.config.util.Globals;
import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.payment.CreatePaymentRequest;
import bo.edu.ucb.backend_simsml.dto.payment.UpdatePaymentRequest;
import bo.edu.ucb.backend_simsml.service.PaymentService;
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
@RequestMapping(Globals.baseApi + "payment")
@PreAuthorize("hasRole('ADMIN')")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create")
    public ResponseEntity<Object> createPayment(@Valid @RequestBody CreatePaymentRequest request) {
        try {
            Object response = paymentService.createPayment(request);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al registrar pago", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<Object> getPayments(
            @RequestParam(value = "startDate", required = false) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) LocalDate endDate,
            @RequestParam(value = "status", required = false) Boolean status,
            @PageableDefault(sort = "updatedAt", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        try {
            Object response = paymentService.getPayments(startDate, endDate, status, pageable);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al obtener pagos", e.getMessage()));
        }
    }

    @GetMapping("/")
    public ResponseEntity<Object> getPayment(@RequestParam("paymentId") Long paymentId) {
        try {
            Object response = paymentService.getPayment(paymentId);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al obtener pago", e.getMessage()));
        }
    }

    @PutMapping("/update")
    public ResponseEntity<Object> updatePayment(@Valid @RequestBody UpdatePaymentRequest request) {
        try {
            Object response = paymentService.updatePayment(request);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al actualizar pago", e.getMessage()));
        }
    }

    @PutMapping("/disable")
    public ResponseEntity<Object> disablePayment(@RequestParam("paymentId") Long paymentId) {
        try {
            Object response = paymentService.disablePayment(paymentId);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al anular pago", e.getMessage()));
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
