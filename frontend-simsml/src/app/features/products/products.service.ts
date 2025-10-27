import { Injectable } from "@angular/core";
import { BaseCrudService } from "../../shared/base-crud.service";
import { Product, ProductSummary } from "./products.types";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { catchError, map, Observable, of } from "rxjs";
import { ApiEnvelope, isUnsuccessful } from "../../shared/api.types";

@Injectable({ providedIn: 'root' })
export class ProductsService extends BaseCrudService<Product> {

    constructor(http: HttpClient) {
        super(http, environment.apiUrl + 'product');
    }

    protected override normalize(p: any): Product {
        return {
            productId: p.productId ?? p.id ?? p.product_id,
            name: p.name ?? '',
            description: p.description ?? '',
            code: p.code ?? '',
            suggestedPrice: p.suggestedPrice ?? p.suggested_price ?? '',
            active: typeof p.active === 'boolean' ? p.active : !!p.active,
            categories: Array.isArray(p.categories) ? p.categories
                : Array.isArray(p.categories) ? p.categories
                : (p.categories ? [p.categories] : []),
            unit: p.unit ?? null
        }
    }

    productSummayList(): Observable<ProductSummary[] | null> {
        return this.http.get<ApiEnvelope<any>>(`${this.baseUrl}/allSummary`).pipe(
            map(raw => {
                if (isUnsuccessful(raw)) return null;
                return Array.isArray(raw.result) ? raw.result.map(x => this.normalize(x)) : [];
            }),
            catchError(() => of(null))
        )
    }
}