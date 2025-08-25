package bo.edu.ucb.backend_simsml.dto.customer;

import jakarta.validation.constraints.NotBlank;

public record CreateCustomerRequest(String identityDocument,
                                    String phone,
                                    String address,
                                    @NotBlank String name,
                                    @NotBlank String paternalSurname,
                                    String maternalSurname) {
}
