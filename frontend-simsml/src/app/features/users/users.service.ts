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

  getUserData(): Observable<User | null> {
    return this.http.get<ApiEnvelope<any>>(`${this.baseUrl}/me`).pipe(
      map(raw => isUnsuccessful(raw) ? null : this.normalize(raw.result)),
      catchError(() => of(null))
    );
  }

  updatePassword(dto: { currentPassword: string; newPassword: string; }) {
    return this.http.put<ApiEnvelope<any>>(`${this.baseUrl}/updatePassword`, dto).pipe(
      map(raw => isUnsuccessful(raw) ? null : this.normalize(raw.result)),
      catchError(() => of(null))
    );
  }
}
