import { CategorySummary } from "../categories/categories.types";
import { Unit } from "../units/units.types";

export interface Product {
    productId: number;
    name: string;
    description: string | null;
    code: string;
    suggestedPrice: number;
    active: boolean;
    categories: CategorySummary[];
    unit: Unit;
}

export interface ProductSummary {
    productId: number;
    name: string;
}
