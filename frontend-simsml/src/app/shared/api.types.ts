import { HttpParams } from '@angular/common/http';

export interface SuccessfulResponse<T = any> {
  localDateTime: string;
  status: string;
  message: string;
  result: T;
}

export interface UnsuccessfulResponse {
  localDateTime: string;
  status: string;
  error: string;
  path: string | null;
}

export type ApiEnvelope<T> = SuccessfulResponse<T> | UnsuccessfulResponse;

/** Estructura típica de org.springframework.data.domain.Page<T> */
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  number: number; // 0-based
  size: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
  sort?: any;
  pageable?: any;
}

/** Type guards */
export const isUnsuccessful = (raw: any): raw is UnsuccessfulResponse =>
  !!raw && typeof raw === 'object' && 'error' in raw && 'status' in raw;

export const isSuccessful = <T = any>(raw: any): raw is SuccessfulResponse<T> =>
  !!raw && typeof raw === 'object' && 'result' in raw && 'status' in raw;

/** Helper para armar HttpParams de forma segura */
export const toParams = (obj: Record<string, any>) => {
    let p = new HttpParams();
    for (const [k, v] of Object.entries(obj)) {
        if (v === undefined || v === null || v === '') continue;
        p = p.set(k, v);
    }
    return p;
};
