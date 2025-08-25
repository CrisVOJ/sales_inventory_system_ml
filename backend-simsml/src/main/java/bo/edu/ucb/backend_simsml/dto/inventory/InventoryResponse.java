package bo.edu.ucb.backend_simsml.dto.inventory;

import bo.edu.ucb.backend_simsml.dto.location.LocationResponse;
import bo.edu.ucb.backend_simsml.dto.product.ProductSummary;

public record InventoryResponse(
        Long inventoryId,
        Long currentStock,
        Long minimumStock,
        ProductSummary product,
        LocationResponse location,
        boolean active
) {
}
