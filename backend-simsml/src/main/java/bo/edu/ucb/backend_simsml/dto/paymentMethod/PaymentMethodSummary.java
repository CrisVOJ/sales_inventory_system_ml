package bo.edu.ucb.backend_simsml.dto.paymentMethod;

import bo.edu.ucb.backend_simsml.entity.PaymentMethodEntity;

public record PaymentMethodSummary(
        Long paymentMethodId,
        String name
) {
    public static PaymentMethodSummary from(PaymentMethodEntity paymentMethod) {
        return new PaymentMethodSummary(paymentMethod.getPaymentMethodId(), paymentMethod.getName());
    }
}
