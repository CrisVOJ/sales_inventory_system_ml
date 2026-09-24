import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { CrudColumn, DataTableComponent } from "../../shared/data-table/data-table.component";
import { ModalComponent } from "../../shared/modal/modal.component";
import { CreatePredictionRequest, Prediction } from "./predictions.types";
import { PredictionsService } from "./predictions.service";
import { MessageService } from "primeng/api";
import { PredictionFormComponent } from "./prediction-form.component";
import { PredictionChartComponent } from "./prediction-chart.component";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { FloatLabel } from "primeng/floatlabel";
import { DatePicker, DatePickerModule } from "primeng/datepicker";
import { debounceTime, distinctUntilChanged } from "rxjs";

@Component({
    selector: 'predictions-page',
    templateUrl: './predictions.page.html',
    styleUrls: ['./predictions.page.scss'],
    imports: [
        CommonModule,
        DataTableComponent,
        ModalComponent,
        PredictionFormComponent,
        PredictionChartComponent,
        ReactiveFormsModule,
        FloatLabel,
        DatePickerModule
    ],
})
export class PredictionPage {
    private fb = new FormBuilder();
    private formSubscription?: any;

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
    additionalParams: Record<string, any> = {};

    predicting = false;

    viewMode: 'table' | 'chart' = 'table';

    filterForm: FormGroup = this.fb.group({
        startDate: [null],
        endDate: [null]
    })

    constructor(
        private predictions: PredictionsService,
        private messageService: MessageService
    ) {
        this.load();
    }

    ngOnInit(): void {
        this.formSubscription = this.filterForm.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
        ).subscribe(val => {
            this.applyFilters(val);
        })
    }

    private applyFilters(formValue: any): void {
        this.additionalParams = {};

        if (formValue.startDate) {
            this.additionalParams['startDate'] = this.formatDate(formValue.startDate);
        }

        if (formValue.endDate) {
            this.additionalParams['endDate'] = this.formatDate(formValue.endDate);
        }

        this.page = 1;
        this.load();
    }

    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    load(){
        this.predictions.list({
            q: this.q,
            page: this.page,
            pageSize: this.pageSize,
            additionalParams: this.additionalParams
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
        this.predicting = true;

        this.predictions.createPrediction(payload).subscribe(() => {
            this.closeForm();
            this.load();
            this.messageService.add({ 
                severity: 'success',
                summary: 'Operación Exitosa',
                detail: `Predicción creada exitosamente. Inventario ${payload.inventory}, Meses ${payload.months} y Tipo ${payload.modelType}`
            });
            
            this.predicting = false;
        });
    }
}