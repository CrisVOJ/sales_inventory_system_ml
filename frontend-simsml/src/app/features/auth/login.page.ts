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
        <div class="auth-bg">
            <div class="auth-card" [class.show-forgot]="showForgot">
            <!-- PANEL LOGIN -->
            <section class="panel panel-login">
                <h2>Sistema de Gestión de Ventas e Inventarios</h2>
                <h3>Iniciar Sesión</h3>

                <form [formGroup]="loginForm" (ngSubmit)="doLogin()">
                <p-floatlabel variant="on">
                    <input pInputText id="username" formControlName="username" autocomplete="off" />
                    <label for="username">Usuario</label>
                </p-floatlabel>

                <p-floatlabel variant="on">
                    <input pInputText id="password" type="password" formControlName="password" autocomplete="off" />
                    <label for="password">Contraseña</label>
                </p-floatlabel>

                <button pButton type="submit" label="Entrar" [disabled]="loginForm.invalid || loading"></button>
                </form>

                <p class="hint error" *ngIf="error">{{ error }}</p>

                <button type="button" class="link-btn" (click)="toggleForgot()">
                ¿Olvidaste tu contraseña?
                </button>
            </section>

            <!-- PANEL OLVIDÉ CONTRASEÑA -->
            <section class="panel panel-forgot">
                <h2>Sistema de Gestión de Ventas e Inventarios</h2>
                <h3>Restaurar Contraseña</h3>

                <p class="text-sm">
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                </p>

                <form [formGroup]="forgotForm" (ngSubmit)="sendResetLink()">
                <p-floatlabel variant="on">
                    <input pInputText id="email" formControlName="email" autocomplete="off" />
                    <label for="email">Correo electrónico</label>
                </p-floatlabel>

                <button pButton type="submit" label="Enviar correo"
                        [disabled]="forgotForm.invalid || loadingForgot"></button>
                </form>

                <p class="hint success" *ngIf="info">{{ info }}</p>
                <p class="hint error" *ngIf="errorForgot">{{ errorForgot }}</p>

                <button type="button" class="link-btn" (click)="toggleForgot()">
                ← Volver a iniciar sesión
                </button>
            </section>
            </div>
        </div>
        <!-- <div class="login-wrap">
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
        </div> -->
    `,
    styles:[`
        .auth-bg{
            min-height: 100vh;
            display:flex;
            align-items:center;
            justify-content:center;
            background:#021018 url('/assets/login-bg.jpg') center/cover no-repeat; /* Pon aquí tu fondo */
        }

        .auth-card{
            position:relative;
            width: 420px;
            max-width: 95vw;
            height: 380px;
            overflow:hidden;
            border-radius:14px;
            box-shadow:0 10px 30px rgba(0,0,0,.5);
            background: rgba(10,30,40,0.92);
        }

        .panel{
            position:absolute;
            inset:0;
            padding:1.75rem 2rem;
            display:flex;
            flex-direction:column;
            gap:1rem;
            color:#fff;
            transform:translateX(0);
            transition:transform .4s ease;
        }

        .panel-login{ transform:translateX(0); }
        .panel-forgot{ transform:translateX(100%); }

        .auth-card.show-forgot .panel-login{
            transform:translateX(-100%);
        }
        .auth-card.show-forgot .panel-forgot{
            transform:translateX(0);
        }

        h2{
            margin:0;
            font-size:1rem;
            font-weight:500;
            opacity:.9;
        }
        h3{
            margin:0 0 .5rem;
            font-size:1.3rem;
        }

        form{ display:grid; gap:1rem; }

        .hint{
            margin-top:.5rem;
            font-size:.8rem;
        }
        .hint.error{ color:#ffd3cf; }
        .hint.success{ color:#c7ffcf; }

        .link-btn{
            margin-top:auto;
            border:none;
            background:none;
            color:#8fd3ff;
            font-size:.85rem;
            text-decoration:underline;
            cursor:pointer;
            align-self:flex-start;
        }

        .text-sm{
            font-size:.85rem;
            opacity:.9;
        }
    `]
})
export class LoginPage {
    loading = false;
    error = '';

    loadingForgot = false;
    errorForgot = '';
    info = '';

    showForgot = false;

    loginForm: FormGroup;
    forgotForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private auth: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            username: this.fb.control('', {validators: [Validators.required]}),
            password: this.fb.control('', {validators: [Validators.required]})
        });

        this.forgotForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        })
    }

    toggleForgot() {
        this.showForgot = !this.showForgot;
        this.error = '';
        this.errorForgot = '';
        this.info = '';
    }

    doLogin() {
        if (this.loginForm.invalid) return;
        this.loading = true;
        this.error = '';

        const { username, password } = this.loginForm.value;
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

    sendResetLink() {
        if (this.forgotForm.invalid) return;
        this.loadingForgot = true;
        this.errorForgot = '';
        this.info = '';

        const { email } = this.forgotForm.value;
        this.auth.requestPasswordReset(email!).subscribe({
            next: () => {
                this.loadingForgot = false;
                this.info = 'Si el correo existe en el sistema, se envió un enlace para restaurar tu contraseña.';
            },
            error: () => {
                this.loadingForgot = false;
                this.errorForgot = 'No se pudo enviar el correo. Intenta nuevamente más tarde.';
            }
        });
    }
}