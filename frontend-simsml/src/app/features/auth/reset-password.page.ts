import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { AuthService } from "../../shared/auth/auth.service";

@Component({
    selector: 'app-reset-password',
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
        <div class="auth-bg">
            <div class="reset-card">
            <h2>Sistema de Gestión de Ventas e Inventarios</h2>
            <h3>Cambiar Contraseña</h3>

            <form [formGroup]="form" (ngSubmit)="changePassword()">
                <p-floatlabel variant="on">
                <input pInputText id="password" type="password" formControlName="password" autocomplete="off" />
                <label for="password">Nueva contraseña</label>
                </p-floatlabel>

                <p-floatlabel variant="on">
                <input pInputText id="confirm" type="password" formControlName="confirm" autocomplete="off" />
                <label for="confirm">Confirmar contraseña</label>
                </p-floatlabel>

                <button pButton type="submit" label="Cambiar contraseña"
                        [disabled]="form.invalid || loading"></button>
            </form>

            <p class="hint error" *ngIf="error">{{ error }}</p>
            <p class="hint success" *ngIf="info">{{ info }}</p>
            </div>
        </div>
    `,
    styles: [`
        .auth-bg{
            min-height:100vh;
            display:flex;
            align-items:center;
            justify-content:center;
            background:#021018 url('/assets/login-bg.jpg') center/cover no-repeat;
        }
        .reset-card{
            width:420px;
            max-width:95vw;
            padding:2rem;
            border-radius:14px;
            box-shadow:0 10px 30px rgba(0,0,0,.5);
            background:rgba(10,30,40,0.92);
            color:#fff;
            display:grid;
            gap:1rem;
        }
        h2{ margin:0; font-size:1rem; opacity:.9; }
        h3{ margin:0 0 .5rem; font-size:1.3rem; }
        form{ display:grid; gap:1rem; }
        .hint{ font-size:.85rem; }
        .hint.error{ color:#ffd3cf; }
        .hint.success{ color:#c7ffcf; }
    `]
})
export class ResetPasswordPage {
    form: FormGroup;
    loading = false;
    error = '';
    info = '';
    private token: string;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private auth: AuthService
    ) {
        this.token = this.route.snapshot.paramMap.get('token') ?? '';

        this.form = this.fb.group({
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirm: ['', [Validators.required]]
        });
    }

    changePassword() {
        if (this.form.invalid) return;

        const { password, confirm } = this.form.value;
        if (password !== confirm) {
            this.error = 'Las contraseñas no coinciden.';
            return;
        }

        this.loading = true;
        this.error = '';
        this.info = '';

        this.auth.resetPassword(this.token, password).subscribe({
            next: () => {
                this.loading = false;
                this.info = 'Contraseña cambiada correctamente.';
                setTimeout(() => this.router.navigateByUrl('/auth/login'), 2000);
            },
            error: () => {
                this.loading = false;
                this.error = 'No se pudo cambiar la contraseña. Intenta nuevamente.';
            }
        })
    }
}