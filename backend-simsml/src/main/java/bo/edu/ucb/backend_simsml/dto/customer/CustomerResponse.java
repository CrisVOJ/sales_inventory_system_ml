package bo.edu.ucb.backend_simsml.dto.customer;

import jakarta.validation.constraints.NotBlank;

public record CustomerResponse(
        Long customerId,
        String identityDocument,
        String phone,
        String address,
        String name,
        String paternalSurname,
        String maternalSurname,
        boolean active
) {
}
