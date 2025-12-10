import { Injectable } from "@angular/core";
import { BaseCrudService } from "../../shared/base-crud.service";
import { CreatePredictionRequest, DemandVsPredictionPoint, Prediction } from "./predictions.types";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { ApiEnvelope, isUnsuccessful } from "../../shared/api.types";
import { catchError, map, Observable, of } from "rxjs";

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

    createPrediction(dto: CreatePredictionRequest) {
        return this.http.post<ApiEnvelope<any>>(`${this.baseUrl}/create`, dto).pipe(
            map(raw => !isUnsuccessful(raw) && String(raw.status).startsWith('2')),
            catchError(() => of(false))
        );
    }

    private normalizeDemandPoint(p: any): DemandVsPredictionPoint {
        return {
            monthLabel: p.monthLabel ?? p.month_label ?? '',
            prediction: p.prediction ?? 0,
            demand: p.demand ?? 0
        }
    }

    getDemandVsPrediction(inventoryId: number, startDate?: Date, endDate?: Date): Observable<DemandVsPredictionPoint[]> {
        let params = new HttpParams().set('inventoryId', inventoryId.toString());

        if (startDate) params = params.set('startDate', this.formatDateParam(startDate));
        if (endDate) params = params.set('endDate', this.formatDateParam(endDate));
console.log(params);
        return this.http.get<ApiEnvelope<any>>(`${this.baseUrl}/demand-vs-prediction`, {params}).pipe(
            map(raw =>{
                if (isUnsuccessful(raw)) return [];
                const result = Array.isArray(raw.result) ? raw.result : [];
                return result.map((x: any) => this.normalizeDemandPoint(x));
            }),
            catchError(() => of([]))
        );
    }

    private formatDateParam(date: Date): string {
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const day = `${date.getDate()}`.padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}