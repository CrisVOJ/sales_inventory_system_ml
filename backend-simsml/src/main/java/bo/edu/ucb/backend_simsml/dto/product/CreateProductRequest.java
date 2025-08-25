package bo.edu.ucb.backend_simsml.dto.product;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.Set;

public record CreateProductRequest(@NotBlank String name,
                                   String description,
                                   @NotBlank String code,
                                   @NotNull @DecimalMin("0.0") BigDecimal suggestedPrice,
                                   @NotEmpty Set<@NotNull Long> categories,
                                   @NotNull Long unitId) {
}
