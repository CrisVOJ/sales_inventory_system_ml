import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Output } from "@angular/core";
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MessageService } from "primeng/api";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputTextModule } from "primeng/inputtext";

@Component({
    selector: 'app-profile-password',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputTextModule,
        FloatLabelModule
    ],
    template: `
        <form [formGroup]="form" class="form-grid">

            <p-floatlabel variant="on">
                <input pInputText type="password" id="currentPassword" formControlName="currentPassword" autocomplete="off"/>
                <label for="currentPassword">Contraseña Actual</label>
            </p-floatlabel>

            <p-floatlabel variant="on">
                <input pInputText type="password" id="newPassword" formControlName="newPassword" autocomplete="off"/>
                <label for="newPassword">Nueva Contraseña</label>
            </p-floatlabel>

            <p-floatlabel variant="on">
                <input pInputText type="password" id="confirmPassword" formControlName="confirmPassword" autocomplete="off"/>
                <label for="confirmPassword">Confirmar Contraseña</label>
            </p-floatlabel>

        </form>

        <div class="actions">
            <button class="btn" (click)="save()" [disabled]="form.invalid">
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

    constructor(
        private fb: NonNullableFormBuilder,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.form = this.fb.group({
            currentPassword: this.fb.control('', Validators.required),
            newPassword: this.fb.control('', Validators.required),
            confirmPassword: this.fb.control('', Validators.required),
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
        if(this.form.value.newPassword !== this.form.value.confirmPassword) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Las contraseñas no coinciden.'
            });
            return;
        }

        this.submit.emit({
            currentPassword: this.form.value.currentPassword,
            newPassword: this.form.value.newPassword
        })
    }
}