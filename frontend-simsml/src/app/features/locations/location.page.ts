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
import { MessageService } from "primeng/api";

@Component({
    selector: 'location-page',
    templateUrl: './location.page.html',
    imports: [
        CommonModule,
        DataTableComponent,
        ModalComponent,
        LocationFormComponent,
        ConfirmComponent,
        LocationDetailsComponent
    ]
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

    operationDetail = 'Ubicación creada exitosamente';

    constructor(
        private locations: LocationsService,
        private confirm: ConfirmService,
        private messageService: MessageService
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
                if(!ok) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No autorizado o datos invalidos'
                    })

                    return;
                }

                if(this.editing?.locationId) this.operationDetail = 'Ubicación actualizada exitosamente';
                else this.operationDetail = 'Ubicación creada exitosamente';
                
                this.messageService.add({
                    severity: 'success',
                    summary: 'Operación Exitosa',
                    detail: this.operationDetail
                });

                this.closeForm();
                this.load();
            },
            error: e => {
                if (e.status === 403) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: '403: No autorizado'
                    });
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error inesperado'
                    });
                };
            }
        })
    }

    remove(id: number) {
        this.locations.remove(id, 'locationId').subscribe(ok => {
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
                detail: 'Ubicación eliminada exitosamente'
            })

            this.load();
        })
    }
}