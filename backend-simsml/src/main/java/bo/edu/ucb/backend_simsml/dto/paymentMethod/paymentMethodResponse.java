package bo.edu.ucb.backend_simsml.dto.paymentMethod;

public record paymentMethodResponse(
        Long paymentMethodId,
        String name,
        boolean active
) {
}
