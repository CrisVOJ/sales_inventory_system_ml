package bo.edu.ucb.backend_simsml.dto.inventory;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateInventoryRequest(@NotNull Long inventoryId,
                                     @NotNull @Min(0) Long currentStock,
                                     @Min(0) Long minimumStock,
                                     @NotNull Long product,
                                     @NotNull Long location) {
}
