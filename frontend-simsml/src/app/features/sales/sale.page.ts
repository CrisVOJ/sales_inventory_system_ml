import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { CrudAction, CrudColumn, DataTableComponent } from "../../shared/data-table/data-table.component";
import { ModalComponent } from "../../shared/modal/modal.component";
import { ConfirmComponent } from "../../shared/confirm/confirm.component";
import { Sale } from "./sales.types";
import { SalesService } from "./sales.service";
import { ConfirmService } from "../../shared/confirm/confirm.service";
import { SaleFormComponent } from "./sale-form.component";

@Component({
    selector: 'sales-page',
    imports: [
    CommonModule,
    DataTableComponent,
    ModalComponent,
    ConfirmComponent,
    SaleFormComponent
],
    template: `
        <section class="page">
            <header class="page__header">
                <h1>Ventas</h1>
            </header>

            <app-data-table
                [entityName]="'Producto'"
                [columns]="cols"
                [rows]="rows"
                [total]="total"
                [page]="page"
                [pageSize]="pageSize"
                [actions]="rowActions"
                [searchPlaceholder]="'Buscar...'"
                (create)="openCreate()"
                (onSearch)="search($event)"
                (pageChange)="paginate($event)"
                (action)="onRowAction($event)"
            />

            <app-modal
                [open]="formOpen"
                [title]="formTitle"
                [hasFooter]="false"
                (close)="closeForm()"
            >
                <sale-form
                    *ngIf="formOpen"
                    [value]="editing"
                    (cancel)="closeForm()"
                    (submit)="onSubmitForm($event)"
                />
            </app-modal>

            <!-- <app-modal
                [open]="detailOpen"
                [title]="formTitle"
                [hasFooter]="false"
                (close)="detailOpen = false"
            >
                <product-details [p]="selected"/>
            </app-modal> -->

            <app-confirm/>
        </section>
    `,
    styles: [`
        .page{ 
            background: transparent; 
        }
        .page__header{ 
            margin-bottom: .75rem; 
        }
        h1{ 
            font-size: var(--h3); 
            margin: 0 0 .5rem; 
            color: var(--txt-1); 
        }
    `]
})
export class SalesPage {
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

    constructor(
        private sales: SalesService
    ) {
        this.load();
    }

    load() {
        this.sales.list({
            q: this.q,
            page: this.page,
            pageSize: this.pageSize
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
                if(ok) {
                    this.closeForm();
                    this.load();
                } else {
                    alert('No autorizado o datos invalidos');
                }
            },
            error: e => {
                if (e.status === 403) alert('403: sin permisos suficientes');
                else alert('Error inesperado');
            }
        })
    }
}