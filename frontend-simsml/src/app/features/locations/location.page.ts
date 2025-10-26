import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { CrudAction, CrudColumn, DataTableComponent } from "../../shared/data-table/data-table.component";
import { ModalComponent } from "../../shared/modal/modal.component";
import { LocationFormComponent } from "./location-form.component";
import { ConfirmComponent } from "../../shared/confirm/confirm.component";
import { LocationDetailsComponent } from "./location-details.component";
import { Location } from "./locations.types";
import { LocationsService } from "./locations.service";
import { ConfirmService } from "../../shared/confirm/confirm.service";

@Component({
    selector: 'location-page',
    imports: [
        CommonModule,
        DataTableComponent,
        ModalComponent,
        LocationFormComponent,
        ConfirmComponent,
        LocationDetailsComponent
    ],
    template: `
        <section class="page">
            <header class="page__header">
                <h1>Ubicaciones</h1>
            </header>

            <app-data-table
                [entityName]="'Ubicación'"
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
                <location-form
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
                <location-details [l]="selected"/>
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
export class LocationsPage {
    cols: CrudColumn<Location>[] = [
        {   key: 'code',        header: 'Código'    },
        {   key: 'name',        header: 'Nombre'    },
    ];

    rowActions: CrudAction<Location>[] = [
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

    rows: Location[] = [];
    total = 0;
    page = 1; pageSize = 5;
    q = '';

    constructor(
        private locations: LocationsService,
        private confirm: ConfirmService
    ) {
        this.load();
    }

    load() {
        this.locations.list({
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
    formTitle = 'Agregar Ubicación';
    editing: Partial<Location> | null = null;

    detailOpen = false;
    selected: Location | null = null;

    openCreate() {
        this.formTitle = 'Agregar Ubicación';
        this.editing = null;
        this.formOpen = true;
    }

    openEdit(row: Location) {
        this.formTitle = 'Actualizar Ubicación';
        this.editing = row;
        this.formOpen = true;
    }

    openDetail(row: Location) {
        this.formTitle = 'Detalles de Ubicación';
        this.selected = row;
        this.detailOpen = true;
    }

    async confirmDelete(row: Location) {
        const ok = await this.confirm.ask('Eliminar Ubicación', `¿Está seguro de eliminar la Ubicación: ${row.name}?`);
        if (ok) {
            this.remove(row.locationId);
        }
    }

    closeForm() {
        this.formOpen = false;
        this.editing = null;
    }

    onRowAction(ev: { id: string; row: Location }) {
        switch (ev.id) {
            case 'view': return this.openDetail(ev.row);
            case 'edit': return this.openEdit(ev.row);
            case 'delete': return this.confirmDelete(ev.row);
        }
    }

    onSubmitForm(payload: Partial<Location>) {
        const req$ = this.editing?.locationId
            ? this.locations.update({ ...payload, locationId: this.editing.locationId })
            : this.locations.create(payload);
            
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

    // create(payload: Partial<Category>) {
    //     this.categories.create(payload).subscribe(ok => {
    //         if(ok) this.load();
    //     })
    // }

    // update(id: number, patch: Partial<Category>) {
    //     this.categories.update({ ...patch, categoryId: id }).subscribe(ok => {
    //         if(ok) this.load();
    //     })
    // }

    remove(id: number) {
        this.locations.remove(id, 'locationId').subscribe(ok => {
            if(ok) this.load();
        })
    }
}