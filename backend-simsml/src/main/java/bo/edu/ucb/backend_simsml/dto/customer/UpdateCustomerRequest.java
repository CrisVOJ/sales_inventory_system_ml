package bo.edu.ucb.backend_simsml.dto.customer;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateCustomerRequest(@NotNull Long customerId,
                                    String identityDocument,
                                    String phone,
                                    String address,
                                    @NotBlank String name,
                                    @NotBlank String paternalSurname,
                                    String maternalSurname) {
}
