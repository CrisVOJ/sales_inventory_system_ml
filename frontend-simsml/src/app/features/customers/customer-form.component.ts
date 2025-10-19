import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Customer } from "./customers.types";
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabelModule } from "primeng/floatlabel";

export type CustomerFormValue = Omit<Customer, 'customerId'>

@Component({
    selector: 'customer-form',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        InputTextModule,
        FloatLabelModule
    ],
    template: `
        <form [formGroup]="form" class="grid">
            <p-floatlabel variant="on">
                <input pInputText id="identityDocument" formControlName="identityDocument" autocomplete="off"/>
                <label for="identityDocument">Doc. Identidad</label>
            </p-floatlabel>
            <p-floatlabel variant="on">
                <input pInputText id="name" formControlName="name" autocomplete="off"/>
                <label for="name">Nombre*</label>
            </p-floatlabel>
            <p-floatlabel variant="on">
                <input pInputText id="phone" formControlName="phone" autocomplete="off"/>
                <label for="phone">Teléfono</label>
            </p-floatlabel>
            <p-floatlabel variant="on">
                <input pInputText id="paternalSurname" formControlName="paternalSurname" autocomplete="off"/>
                <label for="paternalSurname">Apellido Paterno*</label>
            </p-floatlabel>
            <p-floatlabel variant="on">
                <input pInputText id="address" formControlName="address" autocomplete="off"/>
                <label for="address">Dirección</label>
            </p-floatlabel>
            <p-floatlabel variant="on">
                <input pInputText id="maternalSurname" formControlName="maternalSurname" autocomplete="off"/>
                <label for="maternalSurname">Apellido Materno</label>
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
    styles: [`
        .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
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
export class CustomerFormComponent {
    @Input() value: Partial<Customer> | null = null;
    @Output() submit = new EventEmitter<CustomerFormValue>();
    @Output() cancel = new EventEmitter<void>();

    form!: FormGroup;

    constructor(private fb: NonNullableFormBuilder) {}

    private patchFromValue(v: Partial<Customer>) {
        this.form.patchValue({
            identityDocument: v.identityDocument ?? '',
            phone: v.phone ?? '',
            address: v.address ?? '',
            name: v.name ?? '',
            paternalSurname: v.paternalSurname ?? '',
            maternalSurname: v.maternalSurname ?? '',
        });
    }

    ngOnInit() {
        this.form = this.fb.group({
            identityDocument: this.fb.control(''),
            phone: this.fb.control(''),
            address: this.fb.control(''),
            name: this.fb.control('', { validators: [Validators.required] }),
            paternalSurname: this.fb.control('', { validators: [Validators.required] }),
            maternalSurname: this.fb.control(''),
        });

        if (this.value) this.patchFromValue(this.value);
    }

    ngOnChanges() {
        if (!this.form || !this.value) return;
        this.patchFromValue(this.value);
    }

    save() {
        this.form.markAllAsTouched();
        if (this.form.invalid) return;

        const dto = this.form.getRawValue() as CustomerFormValue;

        this.submit.emit(dto);
    }
}
