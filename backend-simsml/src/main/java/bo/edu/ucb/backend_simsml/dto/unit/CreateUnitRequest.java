package bo.edu.ucb.backend_simsml.dto.unit;

import jakarta.validation.constraints.NotBlank;

public record CreateUnitRequest(@NotBlank String name) {
}
