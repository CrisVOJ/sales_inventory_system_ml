package bo.edu.ucb.backend_simsml.dto.unit;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateUnitRequest(@NotNull Long unitId,
                                @NotBlank String name) {
}
