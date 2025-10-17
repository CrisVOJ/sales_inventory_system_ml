import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../shared/auth/auth.service";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { ButtonModule } from "primeng/button";
import { FloatLabelModule } from "primeng/floatlabel";

@Component ({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputTextModule,
        PasswordModule,
        ButtonModule,
        FloatLabelModule
    ],
    template: `
        <div class="login-wrap">
        <h2>Iniciar sesión</h2>
        <form [formGroup]="f" (ngSubmit)="doLogin()">
            <p-floatlabel variant="on">
            <input pInputText id="username" formControlName="username" autocomplete="off"/>
            <label for="username">Usuario</label>
            </p-floatlabel>

            <p-floatlabel variant="on">
            <input pInputText id="password" type="password" formControlName="password" autocomplete="off"/>
            <label for="password">Contraseña</label>
            </p-floatlabel>

            <button pButton type="submit" label="Entrar" [disabled]="f.invalid || loading"></button>
        </form>

        <p class="hint" *ngIf="error">{{ error }}</p>
        </div>
    `,
    styles:[`
        .login-wrap{ max-width: 380px; margin: 6rem auto; padding: 2rem; background: var(--bg-2, #2f5660); border-radius: 14px; box-shadow: 0 10px 30px rgba(0,0,0,.25); }
        h2{ margin-top: 0; }
        form{ display: grid; gap: 1rem; }
        .hint{ color: #ffd3cf; margin-top: .75rem; }
    `]
})
export class LoginPage {
    loading = false;
    error = '';

    f!: FormGroup;

    constructor(
        private fb: FormBuilder,
        private auth: AuthService,
        private router: Router
    ) {
        this.f = this.fb.group({
            username: this.fb.control('', {validators: [Validators.required]}),
            password: this.fb.control('', {validators: [Validators.required]})
        })
    }

    doLogin() {
        if (this.f.invalid) return;
        this.loading = true;
        this.error = '';

        const { username, password } = this.f.value;
        this.auth.login(username!, password!).subscribe({
            next: () => { 
                this.loading = false;
                this.router.navigateByUrl('/');
            },
            error: () => {
                this.loading = false;
                this.error = 'Credencianles inválidas o servidor no disponible';
            }
        })
    }
}