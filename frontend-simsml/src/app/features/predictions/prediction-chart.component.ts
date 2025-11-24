import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ChartModule } from "primeng/chart";
import { PredictionsService } from "./predictions.service";
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { FloatLabelModule } from "primeng/floatlabel";
import { SelectModule } from "primeng/select";
import { Locationsummary } from "../locations/locations.types";
import { Inventory } from "../inventories/inventories.types";
import { LocationsService } from "../locations/locations.service";
import { InventoriesService } from "../inventories/inventories.service";
import { MessageService } from "primeng/api";
import { DemandVsPredictionPoint } from "./predictions.types";

@Component({
    selector: 'prediction-chart',
    standalone: true,
    imports: [
        CommonModule,
        ChartModule,
        ReactiveFormsModule,
        FloatLabelModule,
        SelectModule
    ],
    template: `
        <div class="chart-card">
            <header class="chart-card__header">
                <h2>Demanda vs Predicción [Producto]</h2>
            </header>

            <form [formGroup]="filters" class="filters">
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
                <label for="location">Ubicación</label>
                </p-floatlabel>

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
                <label for="inventory">Producto</label>
                </p-floatlabel>

                <button
                type="button"
                class="btn"
                [disabled]="filters.invalid || loading"
                (click)="reloadChart()"
                >
                {{ loading ? 'Cargando...' : 'Actualizar' }}
                </button>
            </form>

            <div class="chart-wrapper">
                <ng-container *ngIf="chartData; else emptyState">
                <p-chart
                    type="line"
                    [data]="chartData"
                    [options]="chartOptions">
                </p-chart>
                </ng-container>

                <ng-template #emptyState>
                <p *ngIf="!loading" class="empty-msg">
                    Selecciona una ubicación y un producto para ver la gráfica.
                </p>
                </ng-template>
            </div>
        </div>
    `,
    styles: [`
        .chart-card {
            background: var(--bg-2, #1f2933);
            border-radius: .75rem;
            padding: 1.25rem 1.5rem;
            box-shadow: 0 0 0 1px rgba(255,255,255,.03);
            min-height: 320px;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        .chart-card__header {
            text-align: center;
        }
        .chart-card h2 {
            margin: 0;
            font-size: 1.1rem;
            color: var(--txt-1, #e5e7eb);
        }

        .filters {
            display: grid;
            grid-template-columns: 1.5fr 1.5fr auto;
            gap: .75rem 1rem;
            align-items: end;
        }

        .btn {
            border: 0;
            padding: .6rem 1.1rem;
            border-radius: .5rem;
            background: var(--header-cyan, #00BFFF);
            color: #fff;
            font-weight: 500;
            font-size: .95rem;
            cursor: pointer;
            white-space: nowrap;
            height: 42px;
        }
        .btn:disabled {
            opacity: .7;
            cursor: default;
        }

        .chart-wrapper {
            position: relative;
            min-height: 260px;
        }

        :host ::ng-deep .p-select {
            display: flex;
            align-items: center;
            height: 42px !important;
        }

        .empty-msg {
            text-align: center;
            margin-top: 2rem;
            color: #9ca3af;
        }

        @media (max-width: 768px) {
            .filters {
                grid-template-columns: 1fr;
            }
            .btn {
                width: 100%;
            }
        }
    `]
})
export class PredictionChartComponent implements OnInit {
    chartData: any;
    chartOptions: any;
    loading = false;

    filters!: FormGroup;

    locationOptions: (Locationsummary & { displayLabel?: string })[] = [];
    inventoryProductsOptions: (Inventory & { displayLabel?: string })[] = [];

    constructor(
        private fb: NonNullableFormBuilder,
        private predictions: PredictionsService,
        private locationsService: LocationsService,
        private inventoriesService: InventoriesService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.configureOptions();
        this.buildForm();
        this.loadLocationOptions();
    }

    private buildForm() {
        this.filters = this.fb.group({
            location: this.fb.control<number | null>(null, { validators: [Validators.required] }),
            inventory: this.fb.control<number | null>(null, { validators: [Validators.required] })
        });

        this.filters.get('location')!.valueChanges.subscribe((locationId) => {
            this.filters.get('inventory')!.setValue(null);
            this.inventoryProductsOptions = [];

            if (!locationId) return;
            const id = Number(locationId);
            if (!isNaN(id)) {
                this.loadInventoryProductsOptions(id);
            }
        });
        
        this.filters.get('inventory')!.valueChanges.subscribe((inventoryId) => {
            if (inventoryId) this.reloadChart();
            else this.chartData = null;
        });
    }

    private configureOptions() {
        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#e5e7eb',
                        usePointStyle: true
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#9ca3af'
                    },
                    grid: {
                        color: 'rgba(156,163,175,0.15)'
                    }
                },
                y: {
                    ticks: {
                        color: '#9ca3af'
                    },
                    grid: {
                        color: 'rgba(156,163,175,0.15)'
                    }
                }
            }
        }
    }

    private loadLocationOptions() {
        this.locationsService.locationsSummaryList().subscribe({
            next: (data) => {
                this.locationOptions = (data || []).map(l => ({
                    ...l,
                    displayLabel: `${l.code} - ${l.name}`
                }));
            },
            error: (e) => {
                this.locationOptions = [];
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar ubicaciones'
                })
            }
        });
    }

    private loadInventoryProductsOptions(locationId: number) {
        this.inventoriesService.inventoryByLocation(locationId).subscribe({
            next: (data) => {
                if (data && data.length) {
                    this.inventoryProductsOptions = data.map(i => ({
                        ...i,
                        displayLabel: `${i.product?.name ?? ''}`
                    }));
                } else {
                    this.inventoryProductsOptions = [];
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Sin Productos',
                        detail: 'El inventario seleccionado no tiene productos.'
                    });
                }
            },
            error: () => {
                this.inventoryProductsOptions = [];
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar productos del inventario.'
                });
            }
        });
    }

    reloadChart() {
        if (this.filters.invalid) return;

        const inventoryId = this.filters.get('inventory')!.value;
        if (!inventoryId) return;

        this.loading = true;
        this.predictions.getDemandVsPrediction(inventoryId).subscribe({
            next: (points) => {
                if (!points || !points.length) {
                    this.chartData = null;
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Sin datos',
                        detail: 'No se encontraron datos de demanda/predicción para ese inventario.'
                    });
                    return;
                }
                this.buildChart(points);
            },
            error: (err) => {
                this.chartData = null;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo cargar la gráfica de demanda vs predicción.'
                });
            },
            complete: () => {
                this.loading = false;
            }
        });
    }

    private buildChart(points: DemandVsPredictionPoint[]) {
        this.chartData = {
            labels: points.map(p => p.monthLabel),
            datasets: [
                {
                    label: 'Demanda',
                    data: points.map(p => p.demand),
                    fill: false,
                    tension: 0.35,
                    borderColor: '#a855f7',
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Predicción',
                    data: points.map(p => p.prediction),
                    fill: false,
                    tension: 0.35,
                    borderColor: '#22d3ee',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        }
    }
}