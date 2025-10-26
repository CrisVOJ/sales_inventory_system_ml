package bo.edu.ucb.backend_simsml.dto.location;

import jakarta.validation.constraints.NotBlank;

public record CreateLocationRequest(@NotBlank String code,
                                    @NotBlank String name) {
}
