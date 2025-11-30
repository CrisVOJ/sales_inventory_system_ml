import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { CrudColumn, DataTableComponent } from "../../shared/data-table/data-table.component";
import { ModalComponent } from "../../shared/modal/modal.component";
import { CreatePredictionRequest, Prediction } from "./predictions.types";
import { PredictionsService } from "./predictions.service";
import { MessageService } from "primeng/api";
import { PredictionFormComponent } from "./prediction-form.component";
import { PredictionChartComponent } from "./prediction-chart.component";

@Component({
    selector: 'predictions-page',
    imports: [
    CommonModule,
    DataTableComponent,
    ModalComponent,
    PredictionFormComponent,
    PredictionChartComponent
],
    template: `
        <section class="page">
            <header class="page__header">
                <h1>Predicciones</h1>

                <div class="tabs">
                  <button
                    class="tab"
                    [class.is-active]="viewMode === 'table'"
                    (click)="viewMode = 'table'">
                    Tabla
                  </button>
                  <button
                    class="tab"
                    [class.is-active]="viewMode === 'chart'"
                    (click)="viewMode = 'chart'">
                    Gráfica
                  </button>
                </div>
            </header>

            <ng-container *ngIf="viewMode === 'table'">
                <app-data-table
                    [entityName]="'Predicción'"
                    [columns]="cols"
                    [rows]="rows"
                    [total]="total"
                    [page]="page"
                    [pageSize]="pageSize"
                    [searchPlaceholder]="'Buscar ...'"
                    (create)="openCreate()"
                    (onSearch)="search($event)"
                    (pageChange)="paginate($event)"
                />
            </ng-container>

            <ng-container *ngIf="viewMode === 'chart'">
                <prediction-chart/>
            </ng-container>

            <app-modal
                [open]="formOpen"
                [title]="formTitle"
                [hasFooter]="false"
                (close)="closeForm()"
            >
                <prediction-form
                    *ngIf="formOpen"
                    (cancel)="closeForm()"
                    (submit)="save($event)"
                />
            </app-modal>
        </section>
    `,
    styles:[`
        .page__header{ margin-bottom: .75rem; }
        h1{ 
            font-size: 2.2rem; 
            margin: 0 0 .5rem; 
            color: var(--txt-1); 
        }
        .page{ background: transparent; }
        .tabs {
            display: inline-flex;
            background: rgba(15, 23, 42, .6);
            border-radius: 999px;
            padding: .15rem;
        }
        .tab {
            border: none;
            background: transparent;
            color: #9ca3af;
            padding: .3rem .9rem;
            border-radius: 999px;
            font-size: .85rem;
            cursor: pointer;
            transition: background .15s, color .15s;
        }
        .tab.is-active {
            background: #0ea5e9;
            color: #0f172a;
            font-weight: 600;
        }
    `]
})
export class PredictionPage {
    cols: CrudColumn<Prediction>[] = [
        { key:'targetMonth',    header:'Mes' },
        { key:'inventory',      header:'Inventario',
            format: (p) => p.inventory?.product?.name ?? ''
        },
        { key:'estimatedAmount',header:'Cantidad Estimada' },
        { key:'reliability',    header:'Confiabilidad (%)' },
    ];

    rows: Prediction[] = [];
    total = 0;
    page = 1; pageSize = 5;
    q = '';

    viewMode: 'table' | 'chart' = 'table';

    constructor(
        private predictions: PredictionsService,
        private messageService: MessageService
    ) {
        this.load();
    }

    load(){
        this.predictions.list({
            q: this.q,
            page: this.page,
            pageSize: this.pageSize
        }).subscribe(r => {
            this.rows = r.rows;
            this.total = r.total;
        });
    }

    search(s: string){
        this.q = s;
        this.page = 1;
        this.load();
    }

    paginate(p: {page:number, pageSize:number}){
        this.page = p.page;
        this.pageSize = p.pageSize;
        this.load();
    }

    formOpen = false;
    formTitle = 'Agregar Predicción';

    openCreate() {
        this.formTitle = 'Agregar Predicción';
        this.formOpen = true;
    }

    closeForm() {
        this.formOpen = false;
    }

    save(payload: CreatePredictionRequest){
        this.predictions.createPrediction(payload).subscribe(() => {
            this.closeForm();
            this.load();
            this.messageService.add({ 
                severity: 'success',
                summary: 'Operación Exitosa',
                detail: `Predicción creada exitosamente. Inventario ${payload.inventory}, Meses ${payload.months} y Tipo ${payload.modelType}`
            });
        });
    }
}