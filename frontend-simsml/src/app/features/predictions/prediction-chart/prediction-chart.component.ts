import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ChartModule } from "primeng/chart";
import { PredictionsService } from "../predictions.service";
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { FloatLabelModule } from "primeng/floatlabel";
import { SelectModule } from "primeng/select";
import { LocationSummary } from "../../locations/locations.types";
import { Inventory } from "../../inventories/inventories.types";
import { LocationsService } from "../../locations/locations.service";
import { InventoriesService } from "../../inventories/inventories.service";
import { MessageService } from "primeng/api";
import { DemandVsPredictionPoint } from "../predictions.types";
import { DatePickerModule } from "primeng/datepicker";
import { debounceTime, distinctUntilChanged } from "rxjs";

@Component({
    selector: 'prediction-chart',
    standalone: true,
    templateUrl: './prediction-chart.component.html',
    styleUrls: ['./prediction-chart.component.scss'],
    imports: [
        CommonModule,
        ChartModule,
        ReactiveFormsModule,
        FloatLabelModule,
        SelectModule,
        DatePickerModule
    ]
})
export class PredictionChartComponent implements OnInit {
    chartData: any;
    chartOptions: any;
    loading = false;

    filters!: FormGroup;

    locationOptions: (LocationSummary & { displayLabel?: string })[] = [];
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
        this.filters.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
        ).subscribe(
            () => this.reloadChart()
        );
    }

    private buildForm() {
        this.filters = this.fb.group({
            location: this.fb.control<number | null>(null, { validators: [Validators.required] }),
            inventory: this.fb.control<number | null>(null, { validators: [Validators.required] }),
            startDate: this.fb.control<Date | null>(null),
            endDate: this.fb.control<Date | null>(null)
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

        const startDate: Date | null = this.filters.get('startDate')!.value;
        const endDate: Date | null = this.filters.get('endDate')!.value;

        if (startDate && endDate && startDate > endDate) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'La fecha de inicio debe ser menor a la fecha de fin.'
            });
            return;
        }

        this.loading = true;
        this.predictions.getDemandVsPrediction(inventoryId, startDate ?? undefined, endDate ?? undefined).subscribe({
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