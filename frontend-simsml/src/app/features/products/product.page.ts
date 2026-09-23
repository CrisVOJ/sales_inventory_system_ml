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
import { MessageService } from "primeng/api";
import { FloatLabel } from "primeng/floatlabel";
import { MultiSelectModule } from "primeng/multiselect";
import { FormBuilder, FormGroup, ReactiveFormsModule, ɵInternalFormsSharedModule } from "@angular/forms";
import { CategorySummary } from "../categories/categories.types";
import { Unit } from "../units/units.types";
import { CategoriesService } from "../categories/categories.service";
import { UnitsService } from "../units/units.service";
import { debounceTime, distinctUntilChanged } from "rxjs";

@Component({
    selector: 'products-page',
    templateUrl: './product.page.html',
    imports: [
        CommonModule,
        DataTableComponent,
        ModalComponent,
        ConfirmComponent,
        ProductFormComponent,
        ProductDetailsComponent,
        FloatLabel,
        MultiSelectModule,
        ɵInternalFormsSharedModule,
        ReactiveFormsModule
    ]
})
export class ProductsPage {
    private fb = new FormBuilder();
    private formSubscription?: any;

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
            id:'delete', label:'Eliminar', icon:'pi-trash',
            color: u => '#E04500'
        }
    ];

    rows: Product[] = [];
    total = 0;
    page = 1; pageSize = 5;
    q = '';
    additionalParams: Record<string, any> = {};

    categoryOptions: CategorySummary[] = [];
    unitOptions: Unit[] = [];

    operationDetail = "Producto creado exitosamente";

    constructor(
        private products: ProductsService,
        private confirm: ConfirmService,
        private messageService: MessageService,
        private categoriesService: CategoriesService,
        private unitsService: UnitsService
    ) {
        this.load();
    }

    filtersForm: FormGroup = this.fb.group({
        categoryIds: [null],
        unitIds: [null]
    })

    ngOnInit() {
        this.loadCategoryOptions();
        this.loadUnitOptions();

        this.formSubscription = this.filtersForm.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
        ).subscribe(val => {
            this.applyFilters(val);
        });
    }

    private loadCategoryOptions() {
        this.categoriesService.categoriesSummaryList().subscribe({
            next: (data) => {
                if (data) {
                    this.categoryOptions = (data || []).map(c => ({
                        ...c,
                        displayLabel: `${c.name}`.trim()
                    }));
                } else {
                    this.categoryOptions = [];
                }
            },
            error: (e) => {
                console.error('Error al cargar el resumen de categorías: ', e);
                this.categoryOptions = [];
            }
        })
    }

    private loadUnitOptions() {
        this.unitsService.getUnits('', true).subscribe({
            next: (data) => {
                if (data) {
                    this.unitOptions = (data || []).map(c => ({
                        ...c,
                        displayLabel: `${c.name}`.trim()
                    }));
                } else {
                    this.unitOptions = [];
                }
            },
            error: (e) => {
                console.error('Error al cargar el resumen de unidades: ', e);
                this.unitOptions = [];
            }
        })
    }

    private applyFilters(formValues: any) {
        this.additionalParams = {};

        if (formValues.categoryIds && formValues.categoryIds.length > 0) {
            this.additionalParams['categoryIds'] = formValues.categoryIds;
        }

        if (formValues.unitIds && formValues.unitIds.length > 0) {
            this.additionalParams['unitIds'] = formValues.unitIds;
        }

        this.page = 1;
        this.load();
    }

    load() {
        this.products.list({
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
                if(!ok) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No autorizado o datos invalidos'
                    })

                    return;
                }

                if (this.editing?.productId) this.operationDetail = 'Producto actualizado exitosamente';
                else this.operationDetail = 'Producto creado exitosamente';
                
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
                        detail: 'No autorizado o datos invalidos'
                    })
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error inesperado'
                    })
                };
            }
        })
    }

    remove(id: number) {
        this.products.remove(id, 'productId').subscribe(ok => {
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
                detail: 'Producto eliminado exitosamente'
            });
            
            this.load();
        })
    }
}