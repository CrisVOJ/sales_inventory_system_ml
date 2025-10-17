import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, delay, map, Observable, of } from "rxjs";
import { User } from '../users/users.types'
import { environment } from "../../../environments/environment";
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { BaseCrudService } from "../../shared/base-crud.service";
import { ApiEnvelope, isUnsuccessful } from "../../shared/api.types";
import { CreateUserRequest, UpdateUserRequest } from "./users.dto";

@Injectable({ providedIn: 'root' })
export class UsersService extends BaseCrudService<User>{

    constructor(http: HttpClient) {
      super(http, environment.apiUrl + 'user');
    }

    protected override normalize(u: any): User {
      return {
        userId: u.userId ?? u.id ?? u.user_id,
        identityDoc: u.identityDoc ?? u.identity_doc ?? '',
        phone: u.phone ?? '',
        address: u.address ?? '',
        name: u.name ?? '',
        paternalSurname: u.paternalSurname ?? u.paternal_surname ?? '',
        maternalSurname: u.maternalSurname ?? u.maternal_surname ?? '',
        email: u.email ?? '',
        username: u.username ?? '',
        isEnabled: typeof u.isEnabled === 'boolean' ? u.isEnabled : !!u.enabled,
        accountNoLocked: typeof u.accountNoLocked === 'boolean' ? u.accountNoLocked : !u.locked,
        roles: Array.isArray(u.roles) ? u.roles
            : Array.isArray(u.role)  ? u.role
            : (u.roles ? [u.roles] : []),
      }
    }

     /** CREATE: arma CreateUserRequest a partir del payload del form */
    // override create(payload: Partial<User>) {
    //   const body: CreateUserRequest = {
    //     identityDoc: payload.identityDoc || '',
    //     phone: payload.phone || '',
    //     address: payload.address ?? '',
    //     name: payload.name || '',
    //     paternalSurname: payload.paternalSurname || '',
    //     maternalSurname: payload.maternalSurname ?? '',
    //     email: payload.email || '',
    //     username: payload.username || '',
    //     roles: Array.isArray(payload.roles) ? payload.roles : [],
    //   };

    //   return this.http.post<ApiEnvelope<any>>(`${this.baseUrl}/create`, body).pipe(
    //     map(raw => !isUnsuccessful(raw) && String(raw.status).startsWith('2')),
    //     catchError(() => of(false))
    //   );
    // }

    // /** UPDATE: arma UpdateUserRequest, ojo con password requerido */
    // override update(id: number, payload: Partial<User>) {
    //   const body: UpdateUserRequest = {
    //     userId: id,
    //     identityDoc: payload.identityDoc || '',
    //     phone: payload.phone || '',
    //     address: payload.address ?? '',
    //     name: payload.name || '',
    //     paternalSurname: payload.paternalSurname || '',
    //     maternalSurname: payload.maternalSurname ?? '',
    //     email: payload.email || '',
    //     username: payload.username || '',
    //     isEnabled: typeof payload.isEnabled === 'boolean' ? payload.isEnabled : true,
    //     accountNoLocked: typeof payload.accountNoLocked === 'boolean' ? payload.accountNoLocked : true,
    //     roles: Array.isArray(payload.roles) ? payload.roles : [],
    //   };

    //   return this.http.put<ApiEnvelope<any>>(`${this.baseUrl}/update`, body).pipe(
    //     map(raw => !isUnsuccessful(raw) && String(raw.status).startsWith('2')),
    //     catchError(() => of(false))
    //   );
    // }

/**Ver la cantidad a pedir de manera automatica, puede ser una sugerencia 
 * Se requiere de otro modelo de inventario mixto
 * Consultar con Pernogama el Dashboard
 * El modelo a parte de hacer la predicción de demanda
 * Habria que hacer un modelo de machine learning para ver el punto de reorden
 * 
 */
}
