import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { User } from './users.types';

import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MultiSelectModule } from 'primeng/multiselect'

interface Role {
  name: string;
  value: string;
}

export type UserFormValue = Omit<User, 'userId'>;

@Component({
  selector: 'user-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    FloatLabelModule,
    MultiSelectModule
],
  template: `
    <form [formGroup]="form" class="grid">

      <!-- Fila 1 -->
      <p-floatlabel variant="on">
        <input pInputText id="identityDoc" formControlName="identityDoc" autocomplete="off"/>
        <label for="identityDoc">Doc. Identidad</label>
      </p-floatlabel>

      <p-floatlabel variant="on">
        <input pInputText id="name" formControlName="name" autocomplete="off"/>
        <label for="name">Nombre*</label>
      </p-floatlabel>

      <p-floatlabel variant="on">
        <input pInputText id="username" formControlName="username" autocomplete="off"/>
        <label for="username">Nombre de Usuario*</label>
      </p-floatlabel>

      <!-- Fila 2 -->
      <p-floatlabel variant="on">
        <input pInputText id="phone" formControlName="phone" autocomplete="off"/>
        <label for="phone">Teléfono*</label>
      </p-floatlabel>

      <p-floatlabel variant="on">
        <input pInputText id="paternalSurname" formControlName="paternalSurname" autocomplete="off"/>
        <label for="paternalSurname">Apellido Paterno*</label>
      </p-floatlabel>

      <p-floatlabel variant="on">
        <input pInputText id="email" formControlName="email" autocomplete="off"/>
        <label for="email">Correo*</label>
      </p-floatlabel>

      <!-- Fila 3 -->
      <p-floatlabel variant="on">
        <input pInputText id="address" formControlName="address" autocomplete="off"/>
        <label for="address">Dirección</label>
      </p-floatlabel>

      <p-floatlabel variant="on">
        <input pInputText id="maternalSurname" formControlName="maternalSurname" autocomplete="off"/>
        <label for="maternalSurname">Apellido Materno</label>
      </p-floatlabel>

      <p-floatlabel variant="on">
        <p-multiselect
          id="roles"
          formControlName="roles"
          [options]="roles"
          optionLabel="name"
          optionValue="value"
          display="chip"
          appendTo="body"
          panelStyleClass="multiselect-panel"
        />
        <label for="role">Rol*</label>
      </p-floatlabel>

    </form>

    <div class="actions full">
      <button 
        type="button" 
        class="btn" 
        [disabled]="form.invalid" 
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

  roles: Role[] = [
      { name: 'Administrador', value: 'ADMIN' },
      { name: 'Empleado', value: 'SELLER' }
  ];
  
  form!: FormGroup;

  constructor(private fb: NonNullableFormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
        identityDoc: this.fb.control(''),
        phone: this.fb.control(''),
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
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const dto = this.form.getRawValue() as UserFormValue;

    this.submit.emit(dto);
  }
}
