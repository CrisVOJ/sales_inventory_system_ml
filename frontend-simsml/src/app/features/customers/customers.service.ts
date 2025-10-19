import { Injectable } from "@angular/core";
import { BaseCrudService } from "../../shared/base-crud.service";
import { Customer } from "./customers.types";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";

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
}