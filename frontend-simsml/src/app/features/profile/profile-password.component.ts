import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Output } from "@angular/core";
import { AbstractControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from "@angular/forms";
import { MessageService } from "primeng/api";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputTextModule } from "primeng/inputtext";
import { MessageModule } from "primeng/message";

@Component({
    selector: 'app-profile-password',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputTextModule,
        FloatLabelModule,
        MessageModule
    ],
    template: `
        <form [formGroup]="form" class="form-grid">

            <div class="field">
                <p-floatlabel variant="on">
                    <input pInputText type="password" id="currentPassword" formControlName="currentPassword" autocomplete="off"/>
                    <label for="currentPassword">Contraseña Actual</label>
                </p-floatlabel>
                @if (isInvalid('currentPassword')) {
                    <p-message 
                        severity="error" 
                        size="small"
                        variant="simple"
                    >Campo requerido.</p-message>
                }
            </div>

            <div class="field">
                <p-floatlabel variant="on">
                    <input pInputText type="password" id="newPassword" formControlName="newPassword" autocomplete="off"/>
                    <label for="newPassword">Nueva Contraseña</label>
                </p-floatlabel>
                @if (isInvalid('newPassword')) {
                    @if (form.get('newPassword')?.errors?.['required']) {
                        <p-message 
                            severity="error" 
                            size="small"
                            variant="simple"
                        >Campo requerido.</p-message>
                    }
                    @if (form.get('newPassword')?.errors?.['minlength']) {
                        <p-message 
                            severity="error" 
                            size="small"
                            variant="simple"
                        >La contraseña debe tener al menos 8 caracteres.</p-message>
                    }
                }
            </div>

            <div class="field">
                <p-floatlabel variant="on">
                    <input pInputText type="password" id="confirmPassword" formControlName="confirmPassword" autocomplete="off"/>
                    <label for="confirmPassword">Confirmar Contraseña</label>
                </p-floatlabel>
                @if (isInvalid('confirmPassword')) {
                    @if (this.form.get('confirmPassword')?.errors?.['required']) {
                        <p-message 
                            severity="error" 
                            size="small"
                            variant="simple"
                        >Campo requerido.</p-message>
                    }
                    @if (this.form.get('confirmPassword')?.errors?.['passwordMismatch']) {
                        <p-message 
                            severity="error" 
                            size="small"
                            variant="simple"
                        >Debe coincidir con la nueva contraseña.</p-message>
                    }
                }
            </div>
        </form>

        <div class="actions">
            <button class="btn" (click)="save()">
            Actualizar Contraseña
            </button>
        </div>
    `,
    styles: [`
        .form-grid {
            display: grid;
            gap: 1rem;
            grid-template-columns: repeat(2, 1fr);
        }
        input {
            background: #EBFEFF;
            color: #000;
            padding: .55rem .7rem;
            border-radius: .4rem;
            width: 100%;
            box-sizing: border-box;
            min-height: 42px;
        }
        label { display: flex; }
        .actions { 
            margin-top: 1rem; 
            text-align: right; 
        }
        .btn {
            background:#00BFFF; 
            color:white; 
            padding:.6rem 1.2rem;
            border-radius:.5rem; 
            border:0; cursor:pointer;
        }
    `]
})
export class ProfilePasswordComponent {
    @Output() submit = new EventEmitter<{ currentPassword: string; newPassword: string; }>();

    form!: FormGroup;

    formSubmitted = false;

    constructor(
        private fb: NonNullableFormBuilder,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.form = this.fb.group({
            currentPassword: this.fb.control('', Validators.required),
            newPassword: this.fb.control('', { validators: [Validators.required, Validators.minLength(8)] }),
            confirmPassword: this.fb.control('', { validators: [Validators.required, this.passwordMatchValidators('newPassword')] }),
        })

        this.form.get('newPassword')!.valueChanges.subscribe(() => {
            this.form.get('confirmPassword')!.updateValueAndValidity();
        })
    }

    resetForm() {
        this.form.reset({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        })
    }

    save() {
        this.formSubmitted = true;
        if(this.form.value.newPassword !== this.form.value.confirmPassword) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Las contraseñas no coinciden.'
            });
            return;
        }

        if(!this.form.valid) {
            this.messageService.add({
                severity: 'info',
                summary: 'Completar Campos Contraseña',
                detail: 'Debe completar todos los campos.'
            });
            return;
        }

        this.submit.emit({
            currentPassword: this.form.value.currentPassword,
            newPassword: this.form.value.newPassword
        })
        this.formSubmitted = false;
    }

    isInvalid(controlName: string) {
        const control = this.form.get(controlName);
        return control?.invalid && (control.touched || this.formSubmitted);
    }


    passwordMatchValidators(otherControlName: string) {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.parent) return null;

            const newPassword = control.parent.get(otherControlName);
            const confirmPassword = control.value;

            return newPassword?.value === confirmPassword ? null : { passwordMismatch: true };
        }
    }
}