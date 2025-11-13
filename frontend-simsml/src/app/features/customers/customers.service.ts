import { Injectable } from "@angular/core";
import { BaseCrudService } from "../../shared/base-crud.service";
import { Customer, CustomerSummary } from "./customers.types";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { catchError, map, Observable, of } from "rxjs";
import { ApiEnvelope, isUnsuccessful } from "../../shared/api.types";

@Injectable({ providedIn: 'root' })
export class CustomersService extends BaseCrudService<Customer>{
    
    constructor(http: HttpClient) {
        super(http, environment.apiUrl + 'customer');
    }

    protected override normalize(c: any): Customer {
        return {
            customerId: c.customerId ?? c.id ?? c.customer_id,
            identityDocument: c.identityDoc ?? c.identityDocument ?? c.identity_doc ?? '',
            phone: c.phone ?? '',
            address: c.address ?? '',
            name: c.name ?? '',
            paternalSurname: c.paternalSurname ?? c.paternal_surname ?? '',
            maternalSurname: c.maternalSurname ?? c.maternal_surname ?? '',
            active: typeof c.active === 'boolean' ? c.active : !!c.enabled
        }
    }

    customerSummayList(): Observable<CustomerSummary[] | null> {
        return this.http.get<ApiEnvelope<any>>(`${this.baseUrl}/allSummary`).pipe(
            map(raw => {
                if (isUnsuccessful(raw)) return null;
                return Array.isArray(raw.result) ? raw.result.map(x => this.normalize(x)) : [];
            }),
            catchError(() => of(null))
        )
    }
}