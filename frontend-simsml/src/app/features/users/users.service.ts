import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, delay, map, Observable, of } from "rxjs";
import { User } from '../users/users.types'
import { environment } from "../../../environments/environment";
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";

// const seed: User[] = Array.from({length: 15}, (_,i)=>({
//     userId: i+1,
//     identityDoc: '123456789',
//     phone: '123456789',
//     address: 'Dirección',
//     name: 'Nombre',
//     paternalSurname: 'Apellido paterno',
//     maternalSurname: 'Materno',
//     email: 'email@gmail.com',
//     username: 'username',
//     password: '*****',
//     isEnabled: true,
//     accountNoLocked: true,
//     role: ['Admin', 'Seller'],
// }));

// src/app/shared/api.types.ts
interface SuccessfulResponse<T = any> {
  localDateTime: string; // ISO
  status: string;        // "200" etc.
  message: string;
  result: T;
}

interface UnsuccessfulResponse {
  localDateTime: string; // ISO
  status: string;        // "404", "500", etc.
  error: string;
  path: string | null;   // en algunos casos vendrá null
}

/** Estructura típica de org.springframework.data.domain.Page<T> */
interface SpringPage<T> {
  content: T[];
  totalElements: number;
  number: number;       // índice de página (0-based)
  size: number;         // tamaño de página
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
  // campos adicionales que puede incluir Spring:
  sort?: any;
  pageable?: any;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
    private base = environment.apiUrl + 'user';
    // private data$ = new BehaviorSubject<User[]>(seed);
    constructor(private http: HttpClient) {}

    /**
     * Lista paginada desde GET /all
     * Query paramas: filter (string), status (boolean), page (0-based), size, sort 
     */
    list(params: {q?:string, page:number, pageSize:number, status?: boolean }): Observable<{ total: number; rows: User[] }> {
        const { q, page, pageSize, status } = params;

        let httpParams = new HttpParams()
            .set('page', String(Math.max(0, page-1))) //backend usa 0-based, UI usa 1-based
            .set('size', String(pageSize))
            .set('sort', 'name,asc');

        if (q) httpParams = httpParams.set('filter', q);
        if (typeof status === 'boolean') httpParams = httpParams.set('status', String(status));

        return this.http.get<SuccessfulResponse<SpringPage<any>> | UnsuccessfulResponse>(`${this.base}/all`, { params: httpParams }).pipe(
            map((raw) => this.unwrapPage<User>(raw)),
            catchError((err: HttpErrorResponse) => {
                const body = err.error as UnsuccessfulResponse | any;
                if (body && typeof body === 'object' && 'status' in body && 'error' in body) {

                }
                return of({ total: 0, rows: [] as User[] })
            })
        );
    }

    // getById(userId: number): Observable<User | null> {
    //   const params = new HttpParams().set('userId', String(userId));
    //   return this.http.get<SuccessfulResponse<any> | UnsuccessfulResponse>
    // }

/**Ver la cantidad a pedir de manera automatica, puede ser una sugerencia 
 * Se requiere de otro modelo de inventario mixto
 * Consultar con Pernogama el Dashboard
 * El modelo a parte de hacer la predicción de demanda
 * Habria que hacer un modelo de machine learning para ver el punto de reorden
 * 
 */

    // ---------- Helpers de “desenvoltura” ----------

  /** Convierte Successful<SpringPage<T>> o Unsuccessful en { total, rows } */
  private unwrapPage<T>(raw: SuccessfulResponse<SpringPage<any>> | UnsuccessfulResponse): { total: number; rows: T[] } {
    // Si el backend devuelve explícitamente UnsuccessfulResponse (sea HTTP 200 o no)
    if ('error' in raw) {
      // Ej.: status "404" → lista vacía
      return { total: 0, rows: [] };
    }

    // SuccessfulResponse con result = Page<T>
    const page = raw.result as SpringPage<any>;
    if (!page || !Array.isArray(page.content)) {
      return { total: 0, rows: [] };
    }

    return {
      total: page.totalElements ?? page.content.length,
      rows: (page.content as any[]).map(this.normalizeUser as any) as T[],
    };
  }

  /** Convierte Successful<T> en T, y Unsuccessful en null */
  private unwrapSingle<T>(raw: SuccessfulResponse<any> | UnsuccessfulResponse): T | null {
    if ('error' in raw) return null;
    const val = raw.result as any;
    if (val == null) return null;
    // Si el recurso es User, lo normalizamos
    if (this.looksLikeUser(val)) return this.normalizeUser(val) as unknown as T;
    return val as T;
  }

  /** Acepta SuccessfulResponse/UnsuccessfulResponse para endpoints tipo “disable” */
  private unwrapAcknowledge(raw: SuccessfulResponse<any> | UnsuccessfulResponse): boolean {
    if ('error' in raw) return false;
    // Si llega SuccessfulResponse, consideramos true (puedes afinar usando message/result)
    return String(raw.status).startsWith('2');
  }

  // ---------- Normalización de User ----------

  private looksLikeUser(u: any): boolean {
    return u && (u.userId != null || u.id != null || u.user_id != null);
  }

  /** Asegura que el objeto cumpla con la interfaz User del front */
  private normalizeUser(u: any): User {
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
      password: undefined, // nunca exponer
      isEnabled: typeof u.isEnabled === 'boolean' ? u.isEnabled : !!u.enabled,
      accountNoLocked: typeof u.accountNoLocked === 'boolean' ? u.accountNoLocked : !u.locked,
      role: Array.isArray(u.role) ? u.role : (u.roles ? u.roles : []),
    };
  }
}
