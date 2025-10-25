import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { CrudAction, CrudColumn, DataTableComponent } from "../../shared/data-table/data-table.component";
import { ModalComponent } from "../../shared/modal/modal.component";
import { ConfirmService } from "../../shared/confirm/confirm.service";
import { ConfirmComponent } from "../../shared/confirm/confirm.component";
import { Product } from "./products.types";
import { ProductsService } from "./products.service";
import { ProductFormComponent } from "./product-form.component";
import { ProductDetailsComponent } from "./product-details.component";

@Component({
    selector: 'customers-page',
    imports: [
    CommonModule,
    DataTableComponent,
    ModalComponent,
    ConfirmComponent,
    ProductFormComponent,
    ProductDetailsComponent
],
    template: `
        <section class="page">
            <header class="page__header">
                <h1>Productos</h1>
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
                <product-form
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
                <product-details [p]="selected"/>
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
export class CategoriesPage {
    cols: CrudColumn<Product>[] = [
        {   key: 'code',            header: 'Código'                },
        {   key: 'name',            header: 'Nombre'                },
        {   key: 'suggestedPrice',  header: 'Precio Recomendado'    },
        {   key: 'categories',      header: 'Categorias',
            format: (p) => p.categories?.map(c => c.name).join(', ') ?? ''
        },
        {   key: 'unit',      header: 'Unidad',
            format: (u) => u.unit?.name ?? ''
        }
    ];

    rowActions: CrudAction<Product>[] = [
        {
            id: 'view', label: 'Detalles', icon: 'pi pi-eye',
            color: c => '#00B4E0'
        },
        { 
            id:'edit',  label:'Editar', icon:'pi-pen-to-square', 
            color: u => '#86E000'
        },
        { 
            id:'setMinPrice',  label:'Establecer Cantidad Minima', icon:'pi-pen-to-square', 
            color: u => '#0C83FF'
        },
        {
            id:'delete', label:'Eliminar', icon:'pi-trash',
            color: u => '#E04500'
        }
    ];

    rows: Product[] = [];
    total = 0;
    page = 1; pageSize = 5;
    q = '';

    constructor(
        private products: ProductsService,
        private confirm: ConfirmService
    ) {
        this.load();
    }

    load() {
        this.products.list({
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
    formTitle = 'Agregar Producto';
    editing: Partial<Product> | null = null;

    detailOpen = false;
    selected: Product | null = null;

    openCreate() {
        this.formTitle = 'Agregar Producto';
        this.editing = null;
        this.formOpen = true;
    }

    openEdit(row: Product) {
        this.formTitle = 'Actualizar Producto';
        this.editing = row;
        this.formOpen = true;
    }

    openDetail(row: Product) {
        this.formTitle = 'Detalles de Product';
        this.selected = row;
        this.detailOpen = true;
    }

    async confirmDelete(row: Product) {
        const ok = await this.confirm.ask('Eliminar Producto', `¿Está seguro de eliminar la Categoría: ${row.name}?`);
        if (ok) {
            this.remove(row.productId);
        }
    }

    closeForm() {
        this.formOpen = false;
        this.editing = null;
    }

    onRowAction(ev: { id: string; row: Product }) {
        switch (ev.id) {
            case 'view': return this.openDetail(ev.row);
            case 'edit': return this.openEdit(ev.row);
            case 'delete': return this.confirmDelete(ev.row);
        }
    }

    onSubmitForm(payload: Partial<Product>) {
        const req$ = this.editing?.productId
            ? this.products.update({ ...payload, productId: this.editing.productId })
            : this.products.create(payload);
            
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

    create(payload: Partial<Product>) {
        this.products.create(payload).subscribe(ok => {
            if(ok) this.load();
        })
    }

    update(id: number, patch: Partial<Product>) {
        this.products.update({ ...patch, productId: id }).subscribe(ok => {
            if(ok) this.load();
        })
    }

    remove(id: number) {
        this.products.remove(id, 'productId').subscribe(ok => {
            if(ok) this.load();
        })
    }
}