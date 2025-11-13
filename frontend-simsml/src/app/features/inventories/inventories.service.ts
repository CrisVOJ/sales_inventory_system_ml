import { Injectable } from "@angular/core";
import { BaseCrudService } from "../../shared/base-crud.service";
import { Inventory } from "./inventories.types";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { catchError, map, Observable, of } from "rxjs";
import { ApiEnvelope, isUnsuccessful } from "../../shared/api.types";
import { Product } from "../products/products.types";

@Injectable({ providedIn: 'root' })
export class InventoriesService extends BaseCrudService<Inventory> {

    constructor(http: HttpClient) {
        super(http, environment.apiUrl + 'inventory');
    }

    protected override normalize(i: any): Inventory {
        return {
            inventoryId: i.inventoryId ?? i.id ?? i.inventory_id,
            currentStock: i.currentStock ?? i.current_stock,
            minimumStock: i.minimumStock ?? i.minimum_stock,
            product: i.product ?? i.product_id,
            location: i.location ?? i.location_id,
            active: typeof i.active === 'boolean' ? i.active : !!i.active
        }
    }

    inventorySummaryList(): Observable<Inventory[] | null> {
        return this.http.get<ApiEnvelope<any>>(`${this.baseUrl}/allSummary`).pipe(
            map(raw => {
                if (isUnsuccessful(raw)) return null;
                return Array.isArray(raw.result) ? raw.result.map(x => this.normalize(x)) : [];
            }),
            catchError(() => of(null))
        )
    }

    inventoryByLocation(locationId: number): Observable<Inventory[]> {
        return this.http.get<ApiEnvelope<any>>(`${this.baseUrl}/location?locationId=${locationId}`).pipe(
            map(raw => {
                if (isUnsuccessful(raw)) return [] as Inventory[];
                return Array.isArray(raw.result) ? raw.result.map(x => this.normalize(x)) : [];
            }),
            catchError(() => of([] as Inventory[])) 
        )
    }
}