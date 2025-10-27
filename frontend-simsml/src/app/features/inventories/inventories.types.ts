import { Location } from "../locations/locations.types";
import { ProductSummary } from "../products/products.types";

export interface Inventory {
    inventoryId: number;
    currentStock: number;
    minimumStock: number;
    product: ProductSummary;
    location: Location;
    active: boolean;
}

export interface InventorySummary {
    inventoryId: number;
    currentStock: number;
    product: ProductSummary;
}