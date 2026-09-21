import { Injectable } from "@angular/core";
import { BaseCrudService } from "../../shared/base-crud.service";
import { Location, LocationSummary } from "./locations.types";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { catchError, map, Observable, of } from "rxjs";
import { ApiEnvelope, isUnsuccessful } from "../../shared/api.types";

@Injectable({ providedIn: 'root' })
export class LocationsService extends BaseCrudService<Location> {


    constructor(http: HttpClient) {
        super(http, environment.apiUrl + 'location');
    }

    protected override normalize(l: any): Location {
        return {
            locationId: l.locationId ?? l.id ?? l.location_id,
            code: l.code ?? '',
            name: l.name ?? '',
            active: typeof l.active === 'boolean' ? l.active : !!l.active
        }
    }

    locationsSummaryList(): Observable<LocationSummary[] | null> {
        return this.http.get<ApiEnvelope<any>>(`${this.baseUrl}/allSummary`).pipe(
            map(raw => {
                if (isUnsuccessful(raw)) return null;
                return Array.isArray(raw.result) ? raw.result.map(x => this.normalize(x)) : [];
            }),
            catchError(() => of(null))
        )
    }

    existByCode(code: string, excludeId?: number | null): Observable<boolean> {
        let params = new HttpParams().set('code', code);

        if (excludeId != null) {
            params = params.set('excludeId', String(excludeId));
        }

        return this.http.get<ApiEnvelope<any>>(`${this.baseUrl}/exists`, { params }).pipe(
            map(raw => {
                if (isUnsuccessful(raw)) return false;

                return !!raw.result;
            }),
            catchError(err => {
                console.error(err);
                return of(false);
            })
        );
    }
}