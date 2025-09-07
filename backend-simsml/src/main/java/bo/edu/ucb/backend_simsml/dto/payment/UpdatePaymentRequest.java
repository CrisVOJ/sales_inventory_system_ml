package bo.edu.ucb.backend_simsml.dto.payment;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdatePaymentRequest(@NotNull Long paymentId,
                                   @NotNull @DecimalMin("0.0") BigDecimal amount,
                                   @NotNull LocalDate date,
                                   String reference,
                                   @NotNull boolean active,
                                   @NotNull Long saleId,
                                   @NotNull Long paymentMethodId) {
}
