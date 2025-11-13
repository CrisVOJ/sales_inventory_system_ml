import { InventorySummary } from "../../inventories/inventories.types";
import { ProductSummary } from "../../products/products.types";
import { SaleSummary } from "../sales.types";

export interface saleDetail {
    saleDetailId: number;
    productQuantity: number;
    unitPrice: number;
    active: boolean;
    sale: SaleSummary;
    product: ProductSummary;
}

export interface SaleItem {
    saleDetailId?: number;
    inventory: InventorySummary;
    productQuantity: number;
    unitPrice: number;
    subTotal?: number;
    active: boolean;
}