import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { CrudAction, CrudColumn, DataTableComponent } from "../../shared/data-table/data-table.component";
import { ModalComponent } from "../../shared/modal/modal.component";
import { Customer } from "./customers.types";
import { CustomersService } from "./customers.service";
import { ConfirmService } from "../../shared/confirm/confirm.service";
import { ConfirmComponent } from "../../shared/confirm/confirm.component";
import { CustomerFormComponent } from "./customer-form.component";
import { CustomerDetailsComponent } from "./customer-details.component";

@Component({
    selector: 'customers-page',
    imports: [
    CommonModule,
    DataTableComponent,
    ModalComponent,
    CustomerFormComponent,
    ConfirmComponent,
    CustomerDetailsComponent
],
    template: `
        <section class="page">
            <header class="page__header">
                <h1>Clientes</h1>
            </header>

            <app-data-table
                [entityName]="'Cliente'"
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
                <customer-form
                    *ngIf="formOpen"
                    [value]="editing"
                    (cancel)="closeForm()"
                    (submit)="onSubmitForm($event)"
                />
            </app-modal>

            <app-modal
                [open]="detailOpen"
                [title]="formTitle"
                [hasFooter]="false"
                (close)="detailOpen = false"
            >
                <customer-details [c]="selected"/>
            </app-modal>

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
export class CustomersPage {
    cols: CrudColumn<Customer>[] = [
        {   key: 'identityDocument', header: 'Doc. Identidad'    },
        {   key: 'name',        header: 'Nombre',   
            format: (c) => [c.name, c.paternalSurname, c.maternalSurname].filter(Boolean).join(' ')
        },
        {   key: 'phone',       header: 'Teléfono'          },
        {   key: 'address',     header: 'Dirección'         },
    ];

    rowActions: CrudAction<Customer>[] = [
        {
            id: 'view', label: 'Detalles', icon: 'pi pi-eye',
            color: c => '#00B4E0'
        },
        { 
            id:'edit',  label:'Editar', icon:'pi-pen-to-square', 
            color: u => '#86E000'
        },
        {
            id:'delete', label:'Eliminar', icon:'pi-trash',
            color: u => '#E04500'
        }
    ];

    rows: Customer[] = [];
    total = 0;
    page = 1; pageSize = 5;
    q = '';

    constructor(
        private customers: CustomersService,
        private confirm: ConfirmService
    ) {
        this.load();
    }

    load() {
        this.customers.list({
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
    formTitle = 'Agregar Cliente';
    editing: Partial<Customer> | null = null;

    detailOpen = false;
    selected: Customer | null = null;

    openCreate() {
        this.formTitle = 'Agregar Cliente';
        this.editing = null;
        this.formOpen = true;
    }

    openEdit(row: Customer) {
        this.formTitle = 'Actualizar Cliente';
        this.editing = row;
        this.formOpen = true;
    }

    openDetail(row: Customer) {
        this.formTitle = 'Detalles de Cliente';
        this.selected = row;
        this.detailOpen = true;
    }

    async confirmDelete(row: Customer) {
        const ok = await this.confirm.ask('Eliminar Cliente', `¿Está seguro de eliminar al Cliente: ${row.name}?`);
        if (ok) {
            this.remove(row.customerId);
        }
    }

    closeForm() {
        this.formOpen = false;
        this.editing = null;
    }

    onRowAction(ev: { id: string; row: Customer }) {
        switch (ev.id) {
            case 'view': return this.openDetail(ev.row);
            case 'edit': return this.openEdit(ev.row);
            case 'delete': return this.confirmDelete(ev.row);
        }
    }

    onSubmitForm(payload: Partial<Customer>) {
        const req$ = this.editing?.customerId
            ? this.customers.update({ ...payload, customerId: this.editing.customerId })
            : this.customers.create(payload);
            
        req$.subscribe({
            next: ok => {
                if(ok) {
                    this.closeForm();
                    this.load();
                } else {
                    console.log('Payload: ', payload);
                    alert('No autorizado o datos invalidos');
                }
            },
            error: e => {
                if (e.status === 403) alert('403: sin permisos suficientes');
                else alert('Error inesperado');
            }
        })
    }

    create(payload: Partial<Customer>) {
        this.customers.create(payload).subscribe(ok => {
            if(ok) this.load();
        })
    }

    update(id: number, patch: Partial<Customer>) {
        this.customers.update({ ...patch, customerId: id }).subscribe(ok => {
            if(ok) this.load();
        })
    }

    remove(id: number) {
        this.customers.remove(id, 'customerId').subscribe(ok => {
            if(ok) this.load();
        })
    }
}