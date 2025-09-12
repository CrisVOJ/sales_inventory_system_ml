package bo.edu.ucb.backend_simsml.dto.supplier;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateSupplierRequest(@NotNull Long supplierId,
                                    @NotBlank String name,
                                    @NotBlank String contact,
                                    @Email String email,
                                    String phone,
                                    String address,
                                    boolean active) {
}
