import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { User } from './users.types';

import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MultiSelectModule } from 'primeng/multiselect';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';

type RoleOption = { name: string, value: string };

export type UserFormValue = Omit<User, 'userId'>;

@Component({
  selector: 'user-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    FloatLabelModule,
    MultiSelectModule,
    MessageModule
],
  template: `
    <form [formGroup]="form" class="grid">

      <!-- Fila 1 -->
      <div class="field">
        <p-floatlabel variant="on">
          <input pInputText id="identityDoc" formControlName="identityDoc" autocomplete="off"/>
          <label for="identityDoc">Doc. Identidad*</label>
        </p-floatlabel>
        @if (isInvalid('identityDoc')) {
          <p-message
            severity="error"
            size="small"
            variant="simple"
          >Campo requerido.</p-message>
        }
      </div>

      <div class="field">
        <p-floatlabel variant="on">
          <input pInputText id="name" formControlName="name" autocomplete="off"/>
          <label for="name">Nombre*</label>
        </p-floatlabel>
        @if (isInvalid('name')) {
          <p-message
            severity="error"
            size="small"
            variant="simple"
          >Campo requerido.</p-message>
        }
      </div>

      <div class="field">
        <p-floatlabel variant="on">
          <input pInputText id="username" formControlName="username" autocomplete="off"/>
          <label for="username">Nombre de Usuario*</label>
        </p-floatlabel>
        @if (isInvalid('username')) {
          <p-message
            severity="error"
            size="small"
            variant="simple"
          >Campo requerido.</p-message>
        }
      </div>

      <!-- Fila 2 -->
      <div class="field">
        <p-floatlabel variant="on">
          <input pInputText id="phone" formControlName="phone" autocomplete="off"/>
          <label for="phone">Teléfono*</label>
        </p-floatlabel>
        @if (isInvalid('phone')) {
          <p-message
            severity="error"
            size="small"
            variant="simple"
          >Campo requerido.</p-message>
        }
      </div>

      <div class="field">
        <p-floatlabel variant="on">
          <input pInputText id="paternalSurname" formControlName="paternalSurname" autocomplete="off"/>
          <label for="paternalSurname">Apellido Paterno*</label>
        </p-floatlabel>
        @if (isInvalid('paternalSurname')) {
          <p-message
            severity="error"
            size="small"
            variant="simple"
          >Campo requerido.</p-message>
        }
      </div>

      <div class="field">
        <p-floatlabel variant="on">
          <input pInputText id="email" formControlName="email" autocomplete="off"/>
          <label for="email">Correo*</label>
        </p-floatlabel>
        @if (isInvalid('email')) {
          @if (this.form.get('email')?.errors?.['required']) {
            <p-message
              severity="error"
              size="small"
              variant="simple"
            >Campo requerido.</p-message>
          }
          @if (this.form.get('email')?.errors?.['email']) {
            <p-message
              severity="error"
              size="small"
              variant="simple"
            >Correo invalido.</p-message>
          }
        }
      </div>

      <!-- Fila 3 -->
      <div class="field">
        <p-floatlabel variant="on">
          <input pInputText id="address" formControlName="address" autocomplete="off"/>
          <label for="address">Dirección</label>
        </p-floatlabel>
      </div>

      <div class="field">
        <p-floatlabel variant="on">
          <input pInputText id="maternalSurname" formControlName="maternalSurname" autocomplete="off"/>
          <label for="maternalSurname">Apellido Materno</label>
        </p-floatlabel>
      </div>

      <div class="field">
        <p-floatlabel variant="on">
          <p-multiselect
            id="roles"
            formControlName="roles"
            [options]="rolesOptions"
            optionLabel="name"
            optionValue="value"
            display="chip"
            appendTo="body"
            panelStyleClass="multiselect-panel"
          />
          <label for="roles">Rol*</label>
        </p-floatlabel>
        @if (isInvalid('roles')) {
          <p-message
            severity="error"
            size="small"
            variant="simple"
          >Campo requerido.</p-message>
        }
      </div>
    </form>

    <div class="actions full">
      <button 
        type="button" 
        class="btn"
        (click)="save()"
      >
        Guardar
      </button>
    </div>
  `,
  styles:[`
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: .9rem 1.2rem;
    }

    input, p-multiselect {
      background: #EBFEFF;
      color: #000;
      padding: .55rem .7rem;
      border-radius: .4rem;
      width: 100%;
      box-sizing: border-box;
      min-height: 42px;
    }

    :host ::ng-deep .p-multiselect {
      display: flex;
      align-items: center;
      height: 42px !important;
    }

    label { display: flex; }

    .actions.full {
      grid-column: 1 / -1;
      display: flex;
      justify-content: center;
      margin-top: 1rem;
    }

    .btn {
      border: 0;
      padding: .6rem 1rem;
      border-radius: .5rem;
      background: var(--header-cyan, #00BFFF);
      color: #fff;
      font-weight: 500;
      font-size: var(--h6, 1rem);
      cursor: pointer;
    }

    @media (max-width: 1024px) {
      .grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 600px) {
      .grid { grid-template-columns: 1fr; }
      .btn { width: 100%; }
    }
  `]
})
export class UserFormComponent {
  @Input() value: Partial<User> | null = null;
  @Output() submit = new EventEmitter<UserFormValue>();
  @Output() cancel = new EventEmitter<void>();

  rolesOptions: RoleOption[] = [];
  
  form!: FormGroup;

  formSubmitted = false;

  constructor(
    private fb: NonNullableFormBuilder,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.rolesOptions = this.buildRoleOptions();
    
    this.form = this.fb.group({
        identityDoc: this.fb.control('', { validators: [Validators.required] }),
        phone: this.fb.control('', { validators: [Validators.required] }),
        address: this.fb.control(''),
        name: this.fb.control('', { validators: [Validators.required] }),
        paternalSurname: this.fb.control('', { validators: [Validators.required] }),
        maternalSurname: this.fb.control(''),
        email: this.fb.control('', { validators: [Validators.required, Validators.email] }),
        username: this.fb.control('', { validators: [Validators.required] }),
        password: this.fb.control(''),
        isEnabled: this.fb.control(true),
        accountNoLocked: this.fb.control(true),
        roles: this.fb.control<string[]>([], { validators: [Validators.required] })
    });

    if (this.value) this.patchFromValue(this.value);
  }

  ngOnChanges(){
    if (!this.form || !this.value) return;
    this.patchFromValue(this.value);
  }

  private buildRoleOptions(): RoleOption[] {
    let allowedCodes: string[] = [];
    try {
      allowedCodes = JSON.parse(localStorage.getItem('roles') || '[]');
    } catch {
      allowedCodes = [];
    }

    if (!allowedCodes.length) allowedCodes = ['ADMIN', 'SELLER'];

    const defaultLabels: Record<string, string> = {
      ADMIN: 'Administrador',
      SELLER: 'Vendedor',
    };

    let customLabels: Record<string, string> = {};
    try {
      customLabels = JSON.parse(localStorage.getItem('roles') || '{}');
    } catch {
      customLabels = {};
    }
    
    const labels = { ...defaultLabels, ...customLabels };
    return allowedCodes.map(code => ({ 
      value: code, 
      name: labels[code] 
    }));
  }

  private patchFromValue(v: Partial<User>){
    this.form.patchValue({
      identityDoc: v.identityDoc ?? '',
      phone: v.phone ?? '',
      address: v.address ?? '',
      name: v.name ?? '',
      paternalSurname: v.paternalSurname ?? '',
      maternalSurname: v.maternalSurname ?? '',
      email: v.email ?? '',
      username: v.username ?? '',
      password: '',
      isEnabled: v.isEnabled ?? true,
      accountNoLocked: v.accountNoLocked ?? true,
      roles: Array.isArray(v.roles) ? v.roles : (v.roles ? [v.roles] : [])
    });
  }

  save(){
    this.formSubmitted = true;

    this.form.markAllAsTouched();
    
    if (this.form.invalid) {
      this.messageService.add({
        severity: 'info',
        summary: 'Completar Campos',
        detail: 'Debe completar todos los campos correctamente.',
      })
      return
    };

    const dto = this.form.getRawValue() as UserFormValue;

    this.submit.emit(dto);

    this.formSubmitted = false;
  }

  isInvalid(controlName: string) {
    const control = this.form.get(controlName);
    return control?.invalid && (control.touched || this.formSubmitted);
  }
}
