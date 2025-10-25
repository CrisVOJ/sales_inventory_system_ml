import { Injectable } from "@angular/core";
import { BaseCrudService } from "../../shared/base-crud.service";
import { Unit } from "./units.types";
import { HttpClient } from "@angular/common/http";
import { ApiEnvelope, isUnsuccessful } from "../../shared/api.types";
import { catchError, map, Observable, of } from "rxjs";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class UnitsService extends BaseCrudService<Unit> {

    constructor(http: HttpClient) {
        super(http, environment.apiUrl + 'unit');
    }

    protected override normalize(u: any): Unit {
        return {
            unitId: u.unitId ?? u.id ?? u.unit_id,
            name: u.name ?? '',
            active: typeof u.active === 'boolean' ? u.active : !!u.active,
        }
    }

    getUnits(filter?: string, status?: boolean): Observable<Unit[] | null> {
        return this.http.get<ApiEnvelope<any>>(`${this.baseUrl}/all?filter=${filter}&status=${status}`).pipe(
            map(raw => {
                if (isUnsuccessful(raw)) return null;
                return Array.isArray(raw.result) ? raw.result.map(x => this.normalize(x)) : [];
            }),
            catchError(() => of(null))
        )
    }
}