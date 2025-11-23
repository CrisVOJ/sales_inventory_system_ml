import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { CrudColumn, DataTableComponent } from "../../shared/data-table/data-table.component";
import { ModalComponent } from "../../shared/modal/modal.component";
import { Prediction } from "./predictions.types";
import { PredictionsService } from "./predictions.service";
import { MessageService } from "primeng/api";
import { PredictionFormComponent } from "./prediction-form.component";

@Component({
    selector: 'predictions-page',
    imports: [
    CommonModule,
    DataTableComponent,
    ModalComponent,
    PredictionFormComponent
],
    template: `
        <section class="page">
            <header class="page__header">
                <h1>Predicciones</h1>
            </header>

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

    save(payload: { inventory: number, months: number }){
        this.predictions.createPrediction(payload).subscribe(() => {
            this.closeForm();
            this.load();
            this.messageService.add({ 
                severity: 'success',
                summary: 'Operación Exitosa',
                detail: `Predicción creada exitosamente. Inventario ${payload.inventory} y Meses ${payload.months}`
            });
        });
    }
}