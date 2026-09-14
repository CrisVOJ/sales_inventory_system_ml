import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { CrudAction, CrudColumn, DataTableComponent } from "../../shared/data-table/data-table.component";
import { ModalComponent } from "../../shared/modal/modal.component";
import { Sale } from "./sales.types";
import { SalesService } from "./sales.service";
import { SaleFormComponent } from "./sale-form.component";
import { MessageService } from "primeng/api";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { DatePicker } from "primeng/datepicker";
import { FloatLabel } from "primeng/floatlabel";
import { MultiSelectModule } from "primeng/multiselect";
import { debounceTime, distinctUntilChanged, Subscription } from "rxjs";
import { CustomerSummary } from "../customers/customers.types";
import { CustomersService } from "../customers/customers.service";
import { UsersService } from "../users/users.service";
import { UserSummary } from "../users/users.types";
import { SaleStatusesService } from "./sale-statuses/sale-statuses.service";
import { SaleStatusSummary } from "./sale-statuses/sale-statuses.types";

@Component({
    selector: 'sales-page',
    templateUrl: './sale.page.html',
    styleUrls: ['./sale.page.scss'],
    imports: [
        ReactiveFormsModule,
        CommonModule,
        DataTableComponent,
        ModalComponent,
        SaleFormComponent,
        DatePicker,
        FloatLabel,
        MultiSelectModule
    ]
})
export class SalesPage {
    private fb = new FormBuilder();
    private formSubscription?: Subscription;

    cols: CrudColumn<Sale>[] = [
        {   key: 'registrationDate',    header: 'Fecha de Registro' },
        {   key: 'user',                header: 'Usuario',
            format: (s) => s.user?.username ?? ''
        },
        {   key: 'customer',            header: 'Cliente',
            format: (s) => s.customer?.name ?? ''
        },
        {   key: 'saleStatus',          header: 'Estado',
            format: (s) => s.saleStatus?.name ?? ''
        },
        {   key: 'total',               header: 'Total' }
    ];

    rowActions: CrudAction<Sale>[] = [
        {
            id:'edit',  label:'Editar', icon:'pi-pen-to-square',
            color: u => '#86E000',
            disabled: s => s.saleStatus?.name === 'ANULADO' || s.saleStatus?.name === 'PAGADO'
        }
    ];

    rows: Sale[] = [];
    total = 0;
    page = 1; pageSize = 5;
    q = '';
    additionalParams: Record<string, any> = {};

    customerOptions: CustomerSummary[] = [];
    userOptions: UserSummary[] = [];
    saleStatusOptions: SaleStatusSummary[] = [];

    filterForm: FormGroup = this.fb.group({
        startDate: [null],
        endDate: [null],
        userIds: [null],
        customerIds: [null],
        statusIds: [null]
    });

    ngOnInit(): void {
        this.loadUserOptions();
        this.loadCustomerOptions();
        this.loadSaleStatusOptions();

        this.formSubscription = this.filterForm.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
        ).subscribe(val => {
            this.applyFilters(val);
        });
    }

    private loadUserOptions() {
        this.usersService.usersSummaryList().subscribe({
            next: (data) => {
                if (data) {
                    this.userOptions = (data || []).map(c => ({
                        ...c,
                        displayLabel: `${c.username} - ${c.name} ${c.paternalSurname}${c.maternalSurname ? ' ' + c.maternalSurname : ''}`.trim()
                    }));
                } else {
                    this.userOptions = [];
                }
            },
            error: (e) => {
                console.error('Error al cargar usuarios: ', e);
                this.userOptions = [];
            }
        })
    }

    private loadCustomerOptions() {
        this.customersService.customerSummayList().subscribe({
            next: (data) => {
                if (data) {
                    this.customerOptions = (data || []).map(c => ({
                        ...c,
                        displayLabel: `${c.name} ${c.paternalSurname}${c.maternalSurname ? ' ' + c.maternalSurname : ''}`.trim()
                    }));
                } else {
                    this.customerOptions = [];
                }
            },
            error: (e) => {
                console.error('Error al cargar clientes: ', e);
                this.customerOptions = [];
            }
        })
    }

    private loadSaleStatusOptions() {
        this.SaleStatusesService.saleStatusesList().subscribe({
            next: (data) => {
                if (data) {
                    this.saleStatusOptions = (data || []).map(c => ({
                        ...c,
                        displayLabel: `${c.name}`.trim()
                    }));
                } else {
                    this.saleStatusOptions = [];
                }
            },
            error: (e) => {
                console.error('Error al cargar estados de venta: ', e);
                this.saleStatusOptions = [];
            }
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

        if (formValue.userIds && formValue.userIds.length > 0) {
            this.additionalParams['userIds'] = formValue.userIds;
        }

        if (formValue.customerIds && formValue.customerIds.length > 0) {
            this.additionalParams['customerIds'] = formValue.customerIds;
        }

        if (formValue.statusIds && formValue.statusIds.length > 0) {
            this.additionalParams['statusIds'] = formValue.statusIds;
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

    constructor(
        private sales: SalesService,
        private messageService: MessageService,
        private usersService: UsersService,
        private customersService: CustomersService,
        private SaleStatusesService: SaleStatusesService
    ) {
        this.load();
    }

    load() {
        this.sales.list({
            q: this.q,
            page: this.page,
            pageSize: this.pageSize,
            sort: 'registrationDate,desc',
            additionalParams: this.additionalParams
        }).subscribe(r => {
            this.rows = r.rows;
            this.total = r.total;
        })
    }

    search(s: string) {
        this.q = s;
        this.page = 1;
        this.load();
    }

    paginate(p: { page: number; pageSize: number }) {
        this.page = p.page;
        this.pageSize = p.pageSize;
        this.load();
    }

    formOpen = false;
    formTitle = 'Agregar Venta';
    editing: Partial<Sale> | null = null;

    detailOpen = false;
    selected: Sale | null = null;

    openCreate() {
        this.formTitle = 'Agregar Venta';
        this.editing = null;
        this.formOpen = true;
    }

    openEdit(row: Sale) {
        this.formTitle = 'Actualizar Venta';
        this.editing = null;
        this.formOpen = true;

        this.sales.getById(row.saleId).subscribe(r => {
            if(!r) {
                alert('No se pudo cargar la venta');
                this.formOpen = false;
                return;
            }
            this.editing = r;
        });
    }

    closeForm() {
        this.formOpen = false;
        this.editing = null;
    }

    onRowAction(ev: { id: string; row: Sale }) {
        switch (ev.id) {
            case 'edit': return this.openEdit(ev.row);
        }
    }

    onSubmitForm(payload: Partial<Sale>) {
        const req$ = this.editing?.saleId
            ? this.sales.update({ ...payload, saleId: this.editing.saleId })
            : this.sales.create(payload);

        req$.subscribe({
            next: ok => {
                if(!ok) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No autorizado o datos invalidos'
                    })

                    return;
                }

                this.messageService.add({
                    severity: 'success',
                    summary: 'Operación Exitosa',
                    detail: this.editing?.saleId
                        ? 'Venta actualizada exitosamente'
                        : 'Venta creada exitosamente'
                });

                this.closeForm();
                this.load();
            },
            error: e => {
                if (e.status === 403) alert('403: sin permisos suficientes');
                else alert('Error inesperado');
            }
        })
    }
}
