package bo.edu.ucb.backend_simsml.dto.location;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateLocationRequest (@NotNull Long locationId,
                                     @NotBlank String code,
                                     @NotBlank String name) {
}
