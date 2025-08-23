package bo.edu.ucb.backend_simsml.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateCategoryRequest(@NotNull Long categoryId,
                                    @NotBlank String name,
                                    String description,
                                    @NotNull boolean active) {
}
