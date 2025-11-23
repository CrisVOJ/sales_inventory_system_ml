import { Injectable } from "@angular/core";
import { BaseCrudService } from "../../shared/base-crud.service";
import { Prediction } from "./predictions.types";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { ApiEnvelope, isUnsuccessful } from "../../shared/api.types";
import { catchError, map, of } from "rxjs";

@Injectable({ providedIn: 'root' })
export class PredictionsService extends BaseCrudService<Prediction> {

    constructor(http: HttpClient) {
        super(http, environment.apiUrl + 'prediction');
    }

    protected override normalize(p: any): Prediction {
        return {
            predictionId: p.predictionId ?? p.id ?? p.prediction_id,
            estimatedAmount: p.estimatedAmount ?? p.estimated_amount ?? 0,
            reliability: p.reliability ?? 0,
            targetMonth: p.targetMonth ?? null,
            inventory: p.inventory ?? null,
            active: typeof p.active === 'boolean' ? p.active : !!p.active
        }
    }

    createPrediction(dto: { inventory: number; months: number }) {
        return this.http.post<ApiEnvelope<any>>(`${this.baseUrl}/create`, dto).pipe(
            map(raw => !isUnsuccessful(raw) && String(raw.status).startsWith('2')),
            catchError(() => of(false))
        );
    }
}