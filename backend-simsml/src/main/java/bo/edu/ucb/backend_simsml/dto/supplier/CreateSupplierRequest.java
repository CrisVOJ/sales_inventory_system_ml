package bo.edu.ucb.backend_simsml.dto.supplier;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateSupplierRequest(@NotBlank String name,
                                    @NotBlank String contact,
                                    @Email String email,
                                    String phone,
                                    String address) {
}
