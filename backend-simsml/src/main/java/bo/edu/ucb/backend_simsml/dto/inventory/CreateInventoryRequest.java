package bo.edu.ucb.backend_simsml.dto.inventory;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateInventoryRequest(@NotNull @Min(0) Long currentStock,
                                     @Min(0) Long minimumStock,
                                     @NotNull Long productId,
                                     @NotNull Long locationId) {
}
