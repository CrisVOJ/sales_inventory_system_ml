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
import { MessageService } from "primeng/api";
import { FloatLabel } from "primeng/floatlabel";
import { MultiSelectModule } from "primeng/multiselect";
import { ProductsService } from "../products/products.service";
import { LocationsService } from "../locations/locations.service";
import { FormBuilder, FormGroup, ɵInternalFormsSharedModule, ReactiveFormsModule } from "@angular/forms";
import { debounceTime, distinctUntilChanged } from "rxjs";
import { LocationSummary } from "../locations/locations.types";
import { ProductSummary } from "../products/products.types";

@Component({
    selector: 'inventory-page',
    templateUrl: './inventory.page.html',
    imports: [
        CommonModule,
        DataTableComponent,
        ModalComponent,
        InventoryFormComponent,
        ConfirmComponent,
        InventoryFormComponent,
        InventoryDetailsComponent,
        FloatLabel,
        MultiSelectModule,
        ɵInternalFormsSharedModule,
        ReactiveFormsModule
    ]
})
export class InventoriesPage {
    private fb = new FormBuilder();
    private formSubscription?: any;

    cols: CrudColumn<Inventory>[] = [
        {   key: 'location',        header: 'Ubicación',
            format: (l) => l.location?.name ?? ''
        },
        {   key: 'product',         header: 'Producto',
            format: (p) => p.product?.name ?? ''
        },
        {   key: 'currentStock',    header: 'Stock Actual'  },
        {   key: 'minimumStock',    header: 'Stock Minimo'  },
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
    additionalParams: Record<string, any> = {};

    locationOptions: LocationSummary[] = [];
    productOptions: ProductSummary[] = [];

    operationDetail = 'Inventario creado exitosamente';

    constructor(
        private inventories: InventoriesService,
        private confirm: ConfirmService,
        private messageService: MessageService,
        private productsService: ProductsService,
        private locationsService: LocationsService
    ) {
        this.load();
    }

    filtersForm: FormGroup = this.fb.group({
        locationIds: [null],
        productIds: [null]
    });

    ngOnInit(): void {
        this.loadLocationOptions();
        this.loadProductOptions();

        this.formSubscription = this.filtersForm.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
        ).subscribe(val => {
            this.applyFilters(val);
        });
    }

    private loadLocationOptions() {
        this.locationsService.locationsSummaryList().subscribe({
            next: (data) => {
                if (data) {
                    this.locationOptions = (data || []).map(c => ({
                        ...c,
                        displayLabel: `${c.code} - ${c.name}`.trim()
                    }));
                } else {
                    this.locationOptions = [];
                }
            },
            error: (e) => {
                console.error('Error al cargar el resumen de ubicaciones: ', e);
                this.locationOptions = [];
            }
        })
    }

    private loadProductOptions() {
        this.productsService.productSummayList().subscribe({
            next: (data) => {
                if (data) {
                    this.productOptions = (data || []).map(c => ({
                        ...c,
                        displayLabel: `${c.name}`.trim()
                    }));
                } else {
                    this.productOptions = [];
                }
            },
            error: (e) => {
                console.error('Error al cargar el resumen de productos: ', e);
                this.productOptions = [];
            }
        })
    }

    private applyFilters(formValues: any) {
        this.additionalParams = {};

        if (formValues.productIds && formValues.productIds.length > 0) {
            this.additionalParams['productIds'] = formValues.productIds;
        }

        if (formValues.locationIds && formValues.locationIds.length > 0) {
            this.additionalParams['locationIds'] = formValues.locationIds;
        }

        this.page = 1;
        this.load();
    }

    load() {
        this.inventories.list({
            q: this.q,
            page: this.page,
            pageSize: this.pageSize,
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
                if(!ok) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No autorizado o datos invalidos'
                    })

                    return;
                }
                
                if (this.editing?.inventoryId) this.operationDetail = 'Inventario actualizado exitosamente';
                else this.operationDetail = 'Inventario creado exitosamente';
                
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
                    })
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error inesperado'
                    })
                }
            }
        })
    }

    remove(id: number) {
        this.inventories.remove(id, 'inventoryId').subscribe(ok => {
            if(!ok) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No autorizado o datos invalidos'
                });

                return;
            }
            
            this.messageService.add({
                severity: 'success',
                summary: 'Operación Exitosa',
                detail: 'Inventario eliminado exitosamente'
            });

            this.load();
        })
    }
}