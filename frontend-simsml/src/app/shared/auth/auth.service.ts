import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { tap, map, catchError, of } from "rxjs";
import { environment } from "../../../environments/environment";
import { AuthLoginRequest, AuthResponse } from "./auth.types";

@Injectable({ providedIn: 'root'})
export class AuthService {
    private key = 'jwt';
    private rolesKey = 'roles';

    constructor(private http: HttpClient) {}

    login(username: string, password: string) {
        const body: AuthLoginRequest = { username, password };
        console.log('Estamos dentro de login', body);
        return this.http.post<AuthResponse>(environment.apiUrl + 'user/login', body).pipe(
            tap(res => {
                console.log('AuthResponse', res);
                const token = res?.jwt;
                const ok = res?.status === true;

                if (ok && token) {
                    localStorage.setItem(this.key, token);

                    if (typeof res.authorities === 'string') {
                        const roles = res.authorities.split(',').map(s => s.trim()).filter(Boolean);
                        localStorage.setItem(this.rolesKey, JSON.stringify(roles));
                    }
                } else {
                    console.warn('Login sin token o sin success = true', res);
                }
            })
        );
    }

    logout() {
        localStorage.removeItem(this.key);
    }

    get token(): string | null {
        return localStorage.getItem(this.key);
    }

    get isLoggedIn(): boolean {
        const token = this.token;
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload?.exp) {
                const now = Math.floor(Date.now() / 1000);
                return now < payload.exp;
            }
            return true;
        } catch {
            return false;
        }
    }

    get roles(): string[] {
        const token = this.token;
        if (!token) return [];
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const roles = payload?.roles || payload?.authorities || [];
            return Array.isArray(roles) ? roles : [roles];
        } catch {
            return [];
        }
    }
}