package bo.edu.ucb.backend_simsml.dto.inventory;

import bo.edu.ucb.backend_simsml.dto.product.ProductSummary;

public record InventoryResponse(
        Long inventoryId,
        Long currentStock,
        Long minimumStock,
        String location,
        ProductSummary product,
        boolean active
) {
}
