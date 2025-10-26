import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { CrudAction, CrudColumn, DataTableComponent } from "../../shared/data-table/data-table.component";
import { ModalComponent } from "../../shared/modal/modal.component";
import { ConfirmService } from "../../shared/confirm/confirm.service";
import { ConfirmComponent } from "../../shared/confirm/confirm.component";
import { CategoryFormComponent } from "./category-form.component";
import { CategoryDetailsComponent } from "./category-details.component";
import { Category } from "./categories.types";
import { CategoriesService } from "./categories.service";

@Component({
    selector: 'categories-page',
    imports: [
        CommonModule,
        DataTableComponent,
        ModalComponent,
        CategoryFormComponent,
        ConfirmComponent,
        CategoryDetailsComponent
    ],
    template: `
        <section class="page">
            <header class="page__header">
                <h1>Categorias</h1>
            </header>

            <app-data-table
                [entityName]="'Categoría'"
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
                <category-form
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
                <cateogory-details [c]="selected"/>
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
    cols: CrudColumn<Category>[] = [
        {   key: 'name',        header: 'Nombre',       },
        {   key: 'description', header: 'Descripción'   },
    ];

    rowActions: CrudAction<Category>[] = [
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

    rows: Category[] = [];
    total = 0;
    page = 1; pageSize = 5;
    q = '';

    constructor(
        private categories: CategoriesService,
        private confirm: ConfirmService
    ) {
        this.load();
    }

    load() {
        this.categories.list({
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
    formTitle = 'Agregar Categoría';
    editing: Partial<Category> | null = null;

    detailOpen = false;
    selected: Category | null = null;

    openCreate() {
        this.formTitle = 'Agregar Categoría';
        this.editing = null;
        this.formOpen = true;
    }

    openEdit(row: Category) {
        this.formTitle = 'Actualizar Categoría';
        this.editing = row;
        this.formOpen = true;
    }

    openDetail(row: Category) {
        this.formTitle = 'Detalles de Categoría';
        this.selected = row;
        this.detailOpen = true;
    }

    async confirmDelete(row: Category) {
        const ok = await this.confirm.ask('Eliminar Categoría', `¿Está seguro de eliminar la Categoría: ${row.name}?`);
        if (ok) {
            this.remove(row.categoryId);
        }
    }

    closeForm() {
        this.formOpen = false;
        this.editing = null;
    }

    onRowAction(ev: { id: string; row: Category }) {
        switch (ev.id) {
            case 'view': return this.openDetail(ev.row);
            case 'edit': return this.openEdit(ev.row);
            case 'delete': return this.confirmDelete(ev.row);
        }
    }

    onSubmitForm(payload: Partial<Category>) {
        const req$ = this.editing?.categoryId
            ? this.categories.update({ ...payload, categoryId: this.editing.categoryId })
            : this.categories.create(payload);
            
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

    create(payload: Partial<Category>) {
        this.categories.create(payload).subscribe(ok => {
            if(ok) this.load();
        })
    }

    update(id: number, patch: Partial<Category>) {
        this.categories.update({ ...patch, categoryId: id }).subscribe(ok => {
            if(ok) this.load();
        })
    }

    remove(id: number) {
        this.categories.remove(id, 'categoryId').subscribe(ok => {
            if(ok) this.load();
        })
    }
}