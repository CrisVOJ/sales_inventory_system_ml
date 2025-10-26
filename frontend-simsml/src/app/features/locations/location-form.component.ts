import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabelModule } from "primeng/floatlabel";
import { Location } from "./locations.types";

export type LocationFormValue = Omit<Location, 'locationId'>

@Component({
    selector: 'location-form',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        InputTextModule,
        FloatLabelModule
    ],
    template: `
        <form [formGroup]="form" class="grid">
            <p-floatlabel variant="on">
                <input pInputText id="code" formControlName="code" autocomplete="off"/>
                <label for="code">Código</label>
            </p-floatlabel>
            <p-floatlabel variant="on">
                <input pInputText id="name" formControlName="name" autocomplete="off"/>
                <label for="name">Nombre*</label>
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
            grid-template-columns: repeat(1, 1fr);
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
export class LocationFormComponent {
    @Input() value: Partial<Location> | null = null;
    @Output() submit = new EventEmitter<LocationFormValue>();
    @Output() cancel = new EventEmitter<void>();

    form!: FormGroup;

    constructor(private fb: NonNullableFormBuilder) {}

    private patchFromValue(v: Partial<Location>) {
        this.form.patchValue({
            code: v.code ?? '',
            name: v.name ?? '',
        });
    }

    ngOnInit() {
        this.form = this.fb.group({
            code: this.fb.control('', { validators: [Validators.required] }),
            name: this.fb.control('', { validators: [Validators.required] }),
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

        const dto = this.form.getRawValue() as LocationFormValue;

        this.submit.emit(dto);
    }
}
