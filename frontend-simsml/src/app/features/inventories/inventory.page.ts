import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { CrudAction, CrudColumn, DataTableComponent } from "../../shared/data-table/data-table.component";
import { ModalComponent } from "../../shared/modal/modal.component";
import { InventoryFormComponent } from "./inventory-form.component";
import { ConfirmComponent } from "../../shared/confirm/confirm.component";
import { Inventory } from "./inventories.types";
import { InventoriesService } from "./inventories.service";
import { ConfirmService } from "../../shared/confirm/confirm.service";
import { InventoryDetailsComponent } from "./inventory-details.component";

@Component({
    selector: 'inventory-page',
    imports: [
    CommonModule,
    DataTableComponent,
    ModalComponent,
    InventoryFormComponent,
    ConfirmComponent,
    InventoryFormComponent,
    InventoryDetailsComponent
],
    template: `
        <section class="page">
            <header class="page__header">
                <h1>Inventarios</h1>
            </header>

            <app-data-table
                [entityName]="'Inventario'"
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
                <inventory-form
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
                <inventory-details [i]="selected"/>
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
export class InventoriesPage {
    cols: CrudColumn<Inventory>[] = [
        {   key: 'currentStock',    header: 'Stock Actual'  },
        {   key: 'minimumStock',    header: 'Stock Minimo'  },
        {   key: 'product',         header: 'Producto',
            format: (p) => p.product?.name ?? ''
        },
        {   key: 'location',        header: 'Ubicación',
            format: (l) => l.location?.name ?? ''
        },
    ];

    rowActions: CrudAction<Inventory>[] = [
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

    rows: Inventory[] = [];
    total = 0;
    page = 1; pageSize = 5;
    q = '';

    constructor(
        private inventories: InventoriesService,
        private confirm: ConfirmService
    ) {
        this.load();
    }

    load() {
        this.inventories.list({
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
    formTitle = 'Agregar Inventario';
    editing: Partial<Inventory> | null = null;

    detailOpen = false;
    selected: Inventory | null = null;

    openCreate() {
        this.formTitle = 'Agregar Inventario';
        this.editing = null;
        this.formOpen = true;
    }

    openEdit(row: Inventory) {
        this.formTitle = 'Actualizar Inventario';
        this.editing = row;
        this.formOpen = true;
    }

    openDetail(row: Inventory) {
        this.formTitle = 'Detalles de Inventario';
        this.selected = row;
        this.detailOpen = true;
    }

    async confirmDelete(row: Inventory) {
        const ok = await this.confirm.ask('Eliminar Inventario', `¿Está seguro de eliminar el Inventario?`);
        if (ok) {
            this.remove(row.inventoryId);
        }
    }

    closeForm() {
        this.formOpen = false;
        this.editing = null;
    }

    onRowAction(ev: { id: string; row: Inventory }) {
        switch (ev.id) {
            case 'view': return this.openDetail(ev.row);
            case 'edit': return this.openEdit(ev.row);
            case 'delete': return this.confirmDelete(ev.row);
        }
    }

    onSubmitForm(payload: Partial<Inventory>) {
        const req$ = this.editing?.inventoryId
            ? this.inventories.update({ ...payload, inventoryId: this.editing.inventoryId })
            : this.inventories.create(payload);
            
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

    remove(id: number) {
        this.inventories.remove(id, 'inventoryId').subscribe(ok => {
            if(ok) this.load();
        })
    }
}