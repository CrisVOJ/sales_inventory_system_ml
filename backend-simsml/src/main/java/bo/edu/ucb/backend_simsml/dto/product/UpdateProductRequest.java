package bo.edu.ucb.backend_simsml.dto.product;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.Set;

public record UpdateProductRequest(@NotNull Long productId,
                                   @NotBlank String name,
                                   String description,
                                   @NotBlank String code,
                                   @NotNull @DecimalMin("0.0") BigDecimal suggestedPrice,
                                   @NotNull Boolean active,
                                   @NotEmpty Set<@NotNull Long> categories,
                                   @NotNull Long unitId) {
}
