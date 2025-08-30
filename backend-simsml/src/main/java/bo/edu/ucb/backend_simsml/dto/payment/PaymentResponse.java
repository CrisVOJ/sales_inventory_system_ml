package bo.edu.ucb.backend_simsml.dto.payment;

import bo.edu.ucb.backend_simsml.dto.paymentMethod.PaymentMethodSummary;
import bo.edu.ucb.backend_simsml.dto.sale.SaleSummary;
import bo.edu.ucb.backend_simsml.dto.user.UserSaleResponse;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PaymentResponse(
        Long paymentId,
        BigDecimal amount,
        LocalDate date,
        String reference,
        boolean active,
        UserSaleResponse user,
        SaleSummary sale,
        PaymentMethodSummary paymentMethod
) {
}
