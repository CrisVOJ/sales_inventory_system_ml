import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { catchError, map, Observable, of } from "rxjs";
import { SaleStatusSummary } from "./sale-statuses.types";
import { ApiEnvelope, isUnsuccessful } from "../../../shared/api.types";

@Injectable({ providedIn: 'root' })
export class SaleStatusesService {

    constructor(private http: HttpClient) { }

    private normalize(s: any): SaleStatusSummary {
        return {
            saleStatusId: s.saleStatusId ?? s.id ?? s.sale_status_id,
            name: s.name ?? '',
        }
    }

    saleStatusesList(): Observable<SaleStatusSummary[] | null> {
        const baseUrl = `${environment.apiUrl}saleStatus/allSummary`;

        return this.http.get<ApiEnvelope<any>>(baseUrl).pipe(
            map(raw => {
                if (isUnsuccessful(raw)) return null;
                return Array.isArray(raw.result) ? raw.result.map(x => this.normalize(x)) : [];
            }),
            catchError(() => of(null))
        );
    }
}