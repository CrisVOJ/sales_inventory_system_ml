import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiEnvelope, SpringPage, isUnsuccessful } from './api.types';

export interface PageResult<T> { total: number; rows: T[]; }

/**
 * TList:  tipo de los elementos en listados/paginación
 * TSingle: tipo del recurso en detalle (por defecto igual a TList)
 */
export abstract class BaseCrudService<TList, TSingle = TList> {
  protected constructor(protected http: HttpClient, protected baseUrl: string) {}
  protected sortDefault = 'id,desc';

  /** Normaliza un ítem de listado */
  protected abstract normalize(item: any): TList;

  /** Normaliza un ítem de detalle. Por defecto reutiliza normalize(). */
  // 👇 DEVUELVE SIEMPRE TSingle
  protected normalizeSingle(item: any): TSingle {
    return this.normalize(item) as unknown as TSingle;
  }

  list(params: { q?: string; page: number; pageSize: number; status?: boolean; sort?: string }): Observable<PageResult<TList>> {
    const { q, page, pageSize, status, sort } = params;
    let hp = new HttpParams()
      .set('page', String(Math.max(0, page - 1)))
      .set('size', String(pageSize))
      .set('sort', sort || this.sortDefault)
      .set('status', Boolean(true));
    if (q) hp = hp.set('filter', q);
    if (typeof status === 'boolean') hp = hp.set('status', String(status));

    return this.http.get<ApiEnvelope<SpringPage<any>>>(`${this.baseUrl}/all`, { params: hp }).pipe(
      map(raw => {
        if (isUnsuccessful(raw)) return { total: 0, rows: [] as TList[] };
        const page = raw.result;
        const rows = Array.isArray(page?.content) ? page.content.map(x => this.normalize(x)) : [];
        return { total: page?.totalElements ?? rows.length, rows };
      }),
      catchError(() => of({ total: 0, rows: [] as TList[] }))
    );
  }

  /** getById con salida Observable<TSingle | null> */
  getById(id: string | number): Observable<TSingle | null> {
    return this.http.get<ApiEnvelope<any>>(`${this.baseUrl}/${id}`).pipe(
      map(raw => {
        if (isUnsuccessful(raw)) return null;
        return this.normalizeSingle(raw.result); // <- ahora siempre TSingle
      }),
      catchError(() => of(null))
    );
  }

  create(dto: Partial<TSingle>): Observable<boolean> {
    return this.http.post<ApiEnvelope<any>>(`${this.baseUrl}/create`, dto).pipe(
      map(raw => !isUnsuccessful(raw) && String(raw.status).startsWith('2')),
      catchError(() => of(false))
    );
  }

  update(id: string | number, dto: Partial<TSingle>): Observable<boolean> {
    const body: any = { ...dto, userId: id };
    return this.http.put<ApiEnvelope<any>>(`${this.baseUrl}/update`, body).pipe(
      map(raw => !isUnsuccessful(raw) && String(raw.status).startsWith('2')),
      catchError(() => of(false))
    );
  }

  remove(id: string | number): Observable<boolean> {
    return this.http.delete<ApiEnvelope<any>>(`${this.baseUrl}/disable?userId=${id}`).pipe(
      map(raw => !isUnsuccessful(raw) && String(raw.status).startsWith('2')),
      catchError(() => of(false))
    );
  }

  protected acknowledge(url: string, body?: any): Observable<boolean> {
    const req = body ? this.http.post<ApiEnvelope<any>>(url, body) : this.http.post<ApiEnvelope<any>>(url, {});
    return req.pipe(
      map(raw => !isUnsuccessful(raw) && String(raw.status).startsWith('2')),
      catchError(() => of(false))
    );
  }
}
