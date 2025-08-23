package bo.edu.ucb.backend_simsml.dto.category;

import jakarta.validation.constraints.NotBlank;

public record CreateCategoryRequest(@NotBlank String name,
                                    String description) {
}
