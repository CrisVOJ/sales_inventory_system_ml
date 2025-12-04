import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CreatePredictionRequest, Prediction, PredictionModelType } from "./predictions.types";
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { FloatLabelModule } from "primeng/floatlabel";
import { DatePickerModule } from "primeng/datepicker";
import { SelectModule } from "primeng/select";
import { Locationsummary } from "../locations/locations.types";
import { LocationsService } from "../locations/locations.service";
import { Inventory } from "../inventories/inventories.types";
import { InventoriesService } from "../inventories/inventories.service";
import { MessageService } from "primeng/api";
import { MessageModule } from "primeng/message";

export type PredictionFormValue = Omit<Prediction, 'predictionId'>

@Component({
    selector: 'prediction-form',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        SelectModule,
        FloatLabelModule,
        DatePickerModule,
        MessageModule
    ],
    template: `
        <form [formGroup]="form" class="grid">
            <div class="field">
                <p-floatlabel variant="on">
                    <p-select
                        id="location"
                        formControlName="location"
                        [options]="locationOptions"
                        optionLabel="displayLabel"
                        optionValue="locationId"
                        appendTo="body"
                        [filter]="true"
                    />
                    <label for="location">Ubicación*</label>
                </p-floatlabel>
                @if (isInvalid('location')) {
                    <p-message
                        severity="error"
                        size="small"
                        variant="simple"
                    >Campo requerido.</p-message>
                }
            </div>

            <div class="field">
                <p-floatlabel variant="on">
                    <p-select
                        id="inventory"
                        formControlName="inventory"
                        [options]="inventoryProductsOptions"
                        optionLabel="displayLabel"
                        optionValue="inventoryId"
                        appendTo="body"
                        [filter]="true"
                    />
                    <label for="inventory">Producto*</label>
                </p-floatlabel>
                @if (isInvalid('inventory')) {
                    <p-message
                        severity="error"
                        size="small"
                        variant="simple"
                    >Campo requerido.</p-message>
                }
            </div>

            <div class="field">
                <p-floatlabel variant="on">
                    <p-datepicker
                        view="month"
                        dateFormat="dd/mm/yy"
                        [readonlyInput]="true"
                        formControlName="targetMonth"
                        showIcon
                        iconDisplay="input"
                        appendTo="body"
                        [minDate]="minMonth"
                    />
                    <label for="targetMonth">Mes Límite*</label>
                </p-floatlabel>
                @if (isInvalid('targetMonth')) {
                    <p-message
                        severity="error"
                        size="small"
                        variant="simple"
                    >Campo requerido.</p-message>
                }
            </div>

            <div class="field">
                <p-floatlabel variant="on">
                    <p-select
                        id="modelType"
                        formControlName="modelType"
                        [options]="modelTypeOptions"
                        optionLabel="label"
                        optionValue="value"
                        appendTo="body"
                    />
                    <label for="modelType">Tipo de predicción</label>
                </p-floatlabel>
                @if (isInvalid('modelType')) {
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
                [disabled]="loading"
                (click)="save()"
            >
                @if (!loading) {
                    Guardar
                } @else {
                    Procesando...
                }
            </button>
        </div>
    `,
    styles: [`
        .grid {
            display: grid;
            grid-template-columns: repeat(1, 1fr);
            gap: .9rem 1.2rem;
        }

        input, p-select, p-datepicker {
            background: #EBFEFF;
            color: #000;
            padding: .55rem .7rem;
            border-radius: .4rem;
            width: 100%;
            box-sizing: border-box;
            min-height: 42px;
        }

        :host ::ng-deep .p-select,
        :host ::ng-deep .p-datepicker {
            display: flex;
            align-items: center;
            height: 42px !important;
        }

        :host ::ng-deep p-datepicker .p-inputtext {
            background: #EBFEFF;
            border: none;
            width: 100%;
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
            transition: background .2s ease, opacity .2s ease;
        }:disabled {
            background: #0090bf;
            color: #9CA3AF;
            cursor: not-allowed;
            opacity: .8;
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
export class PredictionFormComponent {
    @Input() value: any | null = null;
    @Input() loading = false;

    @Output() submit = new EventEmitter<CreatePredictionRequest>();
    @Output() cancel = new EventEmitter<void>();

    locationOptions: Locationsummary[] = [];
    inventoryProductsOptions: Inventory[] = [];
    modelTypeOptions = [
        { label: 'Serie de tiempo', value: PredictionModelType.PROPHET },
        { label: 'Red Neuronal', value: PredictionModelType.RNN },
    ]

    minMonth!: Date;

    form!: FormGroup;

    formSubmitted = false;

    constructor(
        private fb: NonNullableFormBuilder,
        private locationsService: LocationsService,
        private inventoriesService: InventoriesService,
        private messageService: MessageService
    ) {}

    private patchFromValue(p: any) {
        this.form.patchValue({
            location: p.location ?? '',
            inventory: p.inventory ?? '',
            targetMonth: p.targetMonth ?? '',
            modelType: p.modelType ?? PredictionModelType.PROPHET
        });

        if (p.location) {
            const id = Number(p.location.locationId);
            if (!isNaN(id)) {
                this.loadInventoryProductsOptions(id);
            }
        }
    }
    
    ngOnInit() {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        this.minMonth = new Date(year, month, 1);

        this.form = this.fb.group({
            location: this.fb.control('', { validators: [Validators.required] }),
            inventory: this.fb.control('', { validators: [Validators.required] }),
            targetMonth: this.fb.control('', { validators: [Validators.required] }),
            modelType: this.fb.control<PredictionModelType | ''>(PredictionModelType.PROPHET, 
                { validators: [Validators.required] }
            ),
        });

        this.form.get('location')!.valueChanges.subscribe((locationId) => {
            this.form.get('inventory')!.setValue('');
            this.inventoryProductsOptions = [];

            if (!locationId) return;
            
            const id = Number(locationId);
            if (!isNaN(id)) {
                this.loadInventoryProductsOptions(id);
            }
        })

        this.loadLocationOptions();

        if (this.value) this.patchFromValue(this.value);
    }

    ngOnChanges() {
        if (!this.form || !this.value) return;
        this.patchFromValue(this.value);
    }

    private loadLocationOptions() {
        this.locationsService.locationsSummaryList().subscribe({
            next: (data) => {
                if (data) {
                    this.locationOptions = (data || []).map(l => ({
                        ...l,
                        displayLabel: `${l.code} - ${l.name}`
                    }));
                } else {
                    this.locationOptions = [];
                }
            },
            error: (e) => {
                console.error('Error al cargar el resumen de ubicaciones: ', e);
                this.locationOptions = [];
            }
        })
    }

    private loadInventoryProductsOptions(locationId: number) {
        this.inventoriesService.inventoryByLocation(locationId).subscribe({
            next: (data) => {
                if (data) {
                    this.inventoryProductsOptions = (data || []).map(i => ({
                        ...i,
                        displayLabel: `${i.product?.name ?? ''}`
                    }));
                } else {
                    this.inventoryProductsOptions = [];
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Sin Productos',
                        detail: 'El inventario seleccionado no tiene productos.'
                    })
                }
            },
            error: () => {
                this.inventoryProductsOptions = [];
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar productos del inventario.'
                })
            }
        })
    }

    save() {
        this.formSubmitted = true;

        this.form.markAllAsTouched();

        if (this.form.invalid) {
            this.messageService.add({
                severity: 'info',
                summary: 'Completar Campos',
                detail: 'Debe completar todos los campos correctamente.'
            })

            return;
        }

        const { inventory, targetMonth, modelType } = this.form.getRawValue();

        const selected = new Date(targetMonth);
        if (isNaN(selected.getTime())) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'La fecha seleccionada no es válida.'
            });
            return;
        }

        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        const targetYear = selected.getFullYear();
        const targetMonthIndex = selected.getMonth();

        const diffMonths = (targetYear - currentYear) * 12 + (targetMonthIndex - currentMonth);

        if (diffMonths < 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Mes inválido',
                detail: 'El mes seleccionado no puede ser menor al mes actual.'
            });
            return;
        }

        const months = diffMonths + 1;

        const payload: CreatePredictionRequest = {
            inventory: Number(inventory),
            months,
            modelType: modelType as PredictionModelType,
        }

        this.submit.emit(payload);

        this.formSubmitted = false;
    }

    isInvalid(controlName: string) {
        const control = this.form.get(controlName);
        return control?.invalid && (control.touched || this.formSubmitted);
    }
}