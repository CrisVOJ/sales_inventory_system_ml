import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../shared/auth/auth.service";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { ButtonModule } from "primeng/button";
import { FloatLabelModule } from "primeng/floatlabel";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { MessageModule } from "primeng/message";

@Component ({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputTextModule,
        PasswordModule,
        ButtonModule,
        FloatLabelModule,
        IconFieldModule,
        InputIconModule,
        MessageModule
    ],
    template: `
        <div class="auth-bg">
            <h1 class="title">Sistema de Gestión de Ventas e Inventarios</h1>

            <div class="auth-card" [class.show-forgot]="showForgot">
                <!-- PANEL LOGIN -->
                <section class="panel panel-login">
                    <h2>Iniciar Sesión</h2>

                    <form [formGroup]="loginForm" (ngSubmit)="doLogin()">
                        <div class="field">
                            <p-floatlabel variant="on">
                                <p-iconField>
                                    <p-inputicon class="pi pi-user"/>
                                    <input pInputText id="username" formControlName="username" autocomplete="off" fluid/>
                                </p-iconField>
                                <label for="username">Usuario</label>
                            </p-floatlabel>
                            @if (isInvalid('username')) {
                                @if (this.loginForm.get('username')?.errors?.['required']) {
                                    <p-message 
                                        severity="error" 
                                        size="small"
                                        variant="simple"
                                    >Campo requerido.</p-message>
                                }
                            }
                        </div>
                        
                        <div class="field">
                            <p-floatlabel variant="on">
                                <p-iconField>
                                    <p-inputicon class="pi pi-key"/>
                                    <input pInputText id="password" type="password" formControlName="password" autocomplete="off" fluid/>
                                </p-iconField>
                                <label for="password">Contraseña</label>
                            </p-floatlabel>
                            @if (isInvalid('password')) {
                                @if (this.loginForm.get('password')?.errors?.['required']) {
                                    <p-message 
                                        severity="error" 
                                        size="small"
                                        variant="simple"
                                    >Campo requerido.</p-message>
                                }
                            }
                        </div>

                        <p-button type="submit" label="Iniciar Sesión " [loading]="loading" [disabled]="loading" severity="info" fluid/>
                    </form>

                    <p class="hint error" *ngIf="error">{{ error }}</p>

                    <button type="button" class="link-btn" style="align-self: flex-end;" (click)="toggleForgot()">
                        ¿Olvidaste tu Contraseña?
                    </button>
                </section>

                <!-- PANEL OLVIDÉ CONTRASEÑA -->
                <section class="panel panel-forgot">
                    <h2>Restaurar Contraseña</h2>

                    <p class="text-sm">
                        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                    </p>

                    <form [formGroup]="forgotForm" (ngSubmit)="sendResetLink()">
                        <div class="field">
                            <p-floatlabel variant="on">
                                <p-iconField>
                                    <p-inputicon class="pi pi-envelope"/>
                                    <input pInputText id="email" formControlName="email" autocomplete="off" fluid/>
                                </p-iconField>
                                <label for="email">Correo electrónico</label>
                            </p-floatlabel>
                            @if (isInvalid('email')) {
                                @if (this.forgotForm.get('email')?.errors?.['required']) {
                                    <p-message 
                                        severity="error" 
                                        size="small"
                                        variant="simple"
                                    >Campo requerido.</p-message>
                                }
                                @if (this.forgotForm.get('email')?.errors?.['email']) {
                                    <p-message 
                                        severity="error" 
                                        size="small"
                                        variant="simple"
                                    >Correo electrónico no válido.</p-message>
                                }
                            }
                        </div>

                        <p-button type="submit" label="Enviar Correo" [loading]="loadingForgot" [disabled]="loadingForgot" severity="info" fluid/>
                    </form>

                    <p class="hint success" *ngIf="info">{{ info }}</p>
                    <p class="hint error" *ngIf="errorForgot">{{ errorForgot }}</p>

                    <button type="button" class="link-btn" style="align-self: flex-start;" (click)="toggleForgot()">
                    < Volver a iniciar sesión
                    </button>
                </section>
            </div>
        </div>
    `,
    styles:[`
        .auth-bg{
            min-height: 100vh;
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            background:#021018 url('/assets/login-bg.jpg') center/cover no-repeat;
        }

        .title{
            font-size: var(--h3);
            font-weight: 500;
            color: var(--txt-1);
        }

        .auth-card{
            position:relative;
            width: 420px;
            max-width: 95vw;
            height: 380px;
            overflow:hidden;
            border-radius:14px;
            box-shadow:0 10px 30px rgba(0,0,0,.5);
            background:var(--panel-bg);
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

        .panel h2{
            margin: 0 0 .5rem;
            font-size: var(--h4);
            font-weight:500;
            justify-content: center;
            display: flex;
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
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }
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
        if (this.forgotForm.invalid) {
            this.forgotForm.markAllAsTouched();
            return;
        }
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

    isInvalid(controlName: string) {
        const control = this.loginForm.get(controlName) || this.forgotForm.get(controlName);
        return control?.invalid && (control.dirty || control.touched);
    }
}