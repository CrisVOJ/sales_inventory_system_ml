import { Injectable } from "@angular/core";
import { BaseCrudService, PageResult } from "../../shared/base-crud.service";
import { Sale } from "./sales.types";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { catchError, map, Observable, of, race } from "rxjs";
import { ApiEnvelope, isUnsuccessful } from "../../shared/api.types";

@Injectable({ providedIn: 'root' })
export class SalesService extends BaseCrudService<Sale> {

    constructor(http: HttpClient) {
        super(http, environment.apiUrl + 'sale');
    }

    protected override normalize(s: any): Sale {
        return {
            saleId: s.saleId ?? s.id ?? s.sale_id,
            registrationDate: s.registrationDate ?? s.registration_date,
            user: s.user,
            customer: s.customer,
            saleStatus: s.saleStatus ?? s.sale_status,
            total: s.total,
            saleItems: Array.isArray(s.saleItems) ? s.saleItems.map((d: any) => ({
                saleDetailId: d.saleDetailId ?? d.sale_detail_id,
                inventory: d.inventory,
                productQuantity: d.productQuantity ?? d.product_quantity,
                unitPrice: Number(d.unitPrice ?? d.unit_price),
                subTotal: Number(d.subTotal ?? d.sub_total),
                active: Boolean(d.active)
            }))
            : undefined,
        }
    }

    override getById(id: string | number): Observable<Sale | null> {
        const hp = new HttpParams().set('saleId', String(id));
        return this.http.get<ApiEnvelope<any>>(`${this.baseUrl}/`, { params: hp }).pipe(
            map(raw => isUnsuccessful(raw) ? null : this.normalize(raw.result)),
            catchError(() => of(null))
        )
    }

    createWithItems(dto: Sale): Observable<boolean> {
        return this.http.post<ApiEnvelope<any>>(`${this.baseUrl}/create`, dto).pipe(
            map(raw => !isUnsuccessful(raw) && String(raw.status).startsWith('2')),
            catchError(() => of(false))
        )
    }

    updateHeader(dto: Sale): Observable<boolean> {
    return this.http.put<ApiEnvelope<any>>(`${this.baseUrl}/update`, dto).pipe(
      map(raw => !isUnsuccessful(raw) && String(raw.status).startsWith('2')),
      catchError(() => of(false))
    );
  }
}