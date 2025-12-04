import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Category } from "./categories.types";
import { AbstractControl, AsyncValidatorFn, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabelModule } from "primeng/floatlabel";
import { MessageModule } from "primeng/message";
import { MessageService } from "primeng/api";
import { catchError, debounceTime, map, of, switchMap } from "rxjs";
import { CategoriesService } from "./categories.service";

export type CategoryFormValue = Omit<Category, 'categoryId'>

@Component({
    selector: 'category-form',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        InputTextModule,
        FloatLabelModule,
        MessageModule
    ],
    template: `
        <form [formGroup]="form" class="grid">
            <div class="field">
                <p-floatlabel variant="on">
                    <input pInputText id="name" formControlName="name" autocomplete="off"/>
                    <label for="name">Nombre*</label>
                </p-floatlabel>
                @if (isInvalid('name')) {
                    @if (this.form.get('name')?.errors?.['required']) {
                        <p-message 
                            severity="error" 
                            size="small"
                            variant="simple"
                        >Campo requerido.</p-message>
                    }
                    @if (this.form.get('name')?.errors?.['nameTaken']) {
                        <p-message
                            severity="error"
                            size="small"
                            variant="simple"
                        >Nombre ya existe.</p-message>
                    }
                }
            </div>
            <div class="field">
                <p-floatlabel variant="on">
                    <input pInputText id="description" formControlName="description" autocomplete="off"/>
                    <label for="description">Descripción</label>
                </p-floatlabel>
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
export class CategoryFormComponent {
    @Input() value: Partial<Category> | null = null;
    @Output() submit = new EventEmitter<CategoryFormValue>();
    @Output() cancel = new EventEmitter<void>();

    form!: FormGroup;

    formSubmitted = false;

    constructor(
        private fb: NonNullableFormBuilder,
        private messageService: MessageService,
        private categoriesService: CategoriesService
    ) {}

    private patchFromValue(v: Partial<Category>) {
        this.form.patchValue({
            name: v.name ?? '',
            description: v.description ?? '',
        });
    }

    ngOnInit() {
        this.form = this.fb.group({
            name: this.fb.control('', { 
                validators: [Validators.required],
                asyncValidators: [this.nameUniqueValidator()] 
            }),
            description: this.fb.control(''),
        });

        if (this.value) this.patchFromValue(this.value);
    }

    ngOnChanges() {
        if (!this.form || !this.value) return;
        this.patchFromValue(this.value);
    }

    save() {
        this.formSubmitted = true;

        this.form.markAllAsTouched();

        if (this.form.invalid) {
            this.messageService.add({
                severity: 'info',
                summary: 'Completar Campos',
                detail: 'Debe completar todos los campos correctamente.',
            })

            return;
        };

        const dto = this.form.getRawValue() as CategoryFormValue;
        this.submit.emit(dto);

        this.formSubmitted = false;
    }

    isInvalid(controlName: string) {
        const control = this.form.get(controlName);
        return control?.invalid && (control.dirty || control.touched || this.formSubmitted);
    }

    private nameUniqueValidator(): AsyncValidatorFn {
        return (control: AbstractControl) => {
            const rawValue = control.value as string | null | undefined;
            const value = (rawValue ?? '').trim();

            if (!value) return of(null);

            if (this.value?.categoryId && this.value.name === value) return of(null);

            return of(value).pipe(
                debounceTime(500),
                switchMap(name => 
                    this.categoriesService.existsByName(name, this.value?.categoryId).pipe(
                        map(exists => (exists ? { nameTaken: true } : null)),
                        catchError(err => {
                            console.error('Error al validar el nombre', err);
                            return of(null)
                        })
                    )
                )
            )
        }
    }
}
