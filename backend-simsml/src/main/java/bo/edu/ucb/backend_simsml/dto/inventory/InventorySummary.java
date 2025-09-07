package bo.edu.ucb.backend_simsml.dto.inventory;

import bo.edu.ucb.backend_simsml.dto.product.ProductSummary;
import bo.edu.ucb.backend_simsml.entity.InventoryEntity;

public record InventorySummary(
        Long inventoryId,
        Long currentStock,
        ProductSummary product
) {
    public static InventorySummary from(InventoryEntity inventory) {
        if (inventory == null) return null;
        return new InventorySummary(
                inventory.getInventoryId(),
                inventory.getCurrentStock(),
                ProductSummary.from(inventory.getProduct()));
    }
}
