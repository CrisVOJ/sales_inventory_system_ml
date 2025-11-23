import { InventorySummary } from "../inventories/inventories.types";

export interface Prediction {
    predictionId: number;
    estimatedAmount: number;
    reliability: number;
    targetMonth: string;
    inventory: InventorySummary;
    active: boolean;
}