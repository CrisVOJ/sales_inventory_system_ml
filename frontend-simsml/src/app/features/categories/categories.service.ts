import { Injectable } from "@angular/core";
import { BaseCrudService } from "../../shared/base-crud.service";
import { Category, CategorySummary } from "./categories.types";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { catchError, map, Observable, of } from "rxjs";
import { ApiEnvelope, isUnsuccessful, SuccessfulResponse } from "../../shared/api.types";

@Injectable({ providedIn: 'root' })
export class CategoriesService extends BaseCrudService<Category> {

    constructor(http: HttpClient) {
        super(http, environment.apiUrl + 'category');
    }

    protected override normalize(c: any): Category {
        return {
            categoryId: c.categoryId ?? c.id ?? c.category_id,
            name: c.name ?? '',
            description: c.description ?? '',
            active: typeof c.active === 'boolean' ? c.active : !!c.active
        }
    }

    categoriesSummaryList(): Observable<CategorySummary[] | null> {
        return this.http.get<ApiEnvelope<any>>(`${this.baseUrl}/allSummary`).pipe(
            map(raw => {
                if (isUnsuccessful(raw)) return null;
                return Array.isArray(raw.result) ? raw.result.map(x => this.normalize(x)) : [];
            }),
            catchError(() => of(null))
        )
    }

    existsByName(name: string, excludeId?: number | null): Observable<boolean> {
        let params = new HttpParams().set('name', name);

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
        )
    }
}