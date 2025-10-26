import { Injectable } from "@angular/core";
import { BaseCrudService } from "../../shared/base-crud.service";
import { Location, Locationsummary } from "./locations.types";
import { HttpClient } from "@angular/common/http";
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

    categoriesSummaryList(): Observable<Locationsummary[] | null> {
        return this.http.get<ApiEnvelope<any>>(`${this.baseUrl}/allSummary`).pipe(
            map(raw => {
                if (isUnsuccessful(raw)) return null;
                return Array.isArray(raw.result) ? raw.result.map(x => this.normalize(x)) : [];
            }),
            catchError(() => of(null))
        )
    }
}