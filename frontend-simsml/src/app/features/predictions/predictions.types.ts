import { InventorySummary } from "../inventories/inventories.types";

export interface Prediction {
    predictionId: number;
    estimatedAmount: number;
    reliability: number;
    targetMonth: string;
    inventory: InventorySummary;
    active: boolean;
}

export interface DemandVsPredictionPoint {
    monthLabel: string;
    prediction: number;
    demand: number;
}

export enum PredictionModelType {
    PROPHET = 1,
    RNN = 2
}

export interface CreatePredictionRequest {
    inventory: number;
    months: number;
    modelType: PredictionModelType;
}