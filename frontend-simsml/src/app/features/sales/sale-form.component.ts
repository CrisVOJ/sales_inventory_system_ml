import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Sale } from "./sales.types";
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators, FormsModule, FormArray } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabelModule } from "primeng/floatlabel";
import { SelectModule } from "primeng/select";
import { CustomersService } from "../customers/customers.service";
import { CustomerSummary } from "../customers/customers.types";
import { DatePickerModule } from "primeng/datepicker";
import { Locationsummary } from "../locations/locations.types";
import { LocationsService } from "../locations/locations.service";
import { SaleStatusSummary } from "./sale-statuses/sale-statuses.types";
import { SaleStatusesService } from "./sale-statuses/sale-statuses.service";
import { CommonModule } from "@angular/common";
import { TableModule } from "primeng/table";
import { AutoCompleteModule } from "primeng/autocomplete";
import { ButtonModule } from "primeng/button";
import { InventoriesService } from "../inventories/inventories.service";
import { ProductSummary } from "../products/products.types";
import { Inventory } from "../inventories/inventories.types";
import { SaleItem } from "./sale-details/sale-details.types";

export type SaleFormValue = Omit<Sale, 'saleId'>;

@Component({
    selector: 'sale-form',
    standalone: true,
    imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    FloatLabelModule,
    SelectModule,
    DatePickerModule,
    TableModule,
    AutoCompleteModule,
    ButtonModule,
    FormsModule
],
    template: `
        <form [formGroup]="form" class="grid">

            <p-floatlabel variant="on">
                <p-select
                    id="customer"
                    formControlName="customer"
                    [options]="customerOptions"
                    optionLabel="displayLabel"
                    optionValue="customerId"
                    appendTo="body"
                    [filter]="true"
                />
                <label for="customer">Cliente</label>
            </p-floatlabel>

            <p-floatlabel variant="on">
                <p-datepicker 
                    formControlName="registrationDate" 
                    inputId="registrationDate" 
                    showIcon 
                    iconDisplay="input" 
                    dateFormat="dd/mm/yy" 
                    appendTo="body"
                />
                <label for="on_label">Fecha de Registro</label>
            </p-floatlabel>

            <p-floatlabel variant="on">
                <p-select
                    id="location"
                    formControlName="location"
                    [options]="locationOptions"
                    optionLabel="displayLabel"
                    optionValue="locationId"
                    appendTo="body"
                    [filter]="true"
                    (onChange)="handleLocationChange($event.value)"
                />
                <label for="location">Ubicación</label>
            </p-floatlabel>

            <p-floatlabel variant="on">
                <p-select
                    id="saleStatus"
                    formControlName="saleStatus"
                    [options]="saleStatusOptions"
                    optionLabel="name"
                    optionValue="saleStatusId"
                    appendTo="body"
                    [filter]="true"
                />
                <label for="saleStatus">Estado</label>
            </p-floatlabel>
        </form>

        <!-- Items -->
        <div class="items-header">
            <h3>Productos</h3>
            <button 
                pButton 
                type="button" 
                label="Agregar Ítem" 
                (click)="addItem()" 
                [disabled]="!form.value.location"
            >
            </button>
        </div>

        <p-table
            [value]="saleItems.controls"
            dataKey="id"
            [tableStyle]="{'min-width': '100%'}"
        >
            <ng-template pTemplate="header">
                <tr>
                <th style="width:320px">Producto</th>
                <th style="width:120px">Cantidad</th>
                <th style="width:140px">Precio</th>
                <th style="width:140px">Subtotal</th>
                <th style="width:70px"></th>
                </tr>
            </ng-template>

            <ng-template pTemplate="body" let-row let-rowIndex="rowIndex">
                <tr [formGroup]="row">
                    
                    <td>
                        <p-floatlabel variant="on">
                            <p-select
                                id="inventory"
                                formControlName="inventory"
                                [options]="inventoryProductsOptions"
                                optionLabel="displayLabel"
                                optionValue="inventoryId"
                                appendTo="body"
                                [filter]="true"
                                (onChange)="handleInventoryChange($event.value, rowIndex)"
                            />
                            <label for="inventory">Producto*</label>
                        </p-floatlabel>
                        <!-- Autocomplete: busca por ubicación -->
                        <!-- <p-autoComplete
                        [disabled]="!form.value.location"
                        ngModel="displayProducto[rowIndex]"
                        [(ngModel)]="displayProducts[rowIndex]"
                        (completeMethod)="searchProducts($event, rowIndex)"
                        [suggestions]="suggestions[rowIndex] || []"
                        field="display"
                        [forceSelection]="true"
                        (onSelect)="selectProduct($event, rowIndex)"
                        [placeholder]="form.value.location ? 'Buscar producto...' : 'Seleccione ubicación'" /> -->
                    </td>

                    <td>
                        <input type="number" min="1" formControlName="productQuantity" (input)="recalcRow(rowIndex)" class="num" />
                    </td>

                    <td>
                        <input type="number" min="0" step="0.01" formControlName="unitPrice" (input)="recalcRow(rowIndex)" class="num" />
                    </td>

                    <td>
                        <input [value]="formatMoney(subtotalOf(rowIndex))" readonly class="num readonly" />
                    </td>

                    <td class="actions">
                        <button pButton icon="pi pi-copy" severity="secondary" (click)="cloneRow(rowIndex)" text></button>
                        <button pButton icon="pi pi-trash" severity="danger" (click)="removeRow(rowIndex)" text></button>
                    </td>
                </tr>

                <!-- info secundaria opcional -->
                <tr class="meta">
                    <td colspan="5">
                        <small class="hint" *ngIf="meta[rowIndex]?.stock != null">
                        Stock en ubicación: {{ meta[rowIndex]?.stock }}
                        </small>
                        <small class="warn" *ngIf="stockError(rowIndex)">
                        Cantidad supera el stock disponible.
                        </small>
                    </td>
                </tr>
            </ng-template>

            <ng-template pTemplate="emptymessage">
                <tr><td colspan="5" class="empty">Agrega productos a la venta</td></tr>
            </ng-template>
        </p-table>

        <div class="total">
            <b>Total: {{ formatMoney(total()) }}</b>
        </div>

        <div class="actions full">
        <button 
            type="button" 
            class="btn" 
            [disabled]="form.invalid" 
            (click)="save()"
        >
            Guardar
        </button>
        </div>
    `,
    styles:[`
        .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: .9rem 1.2rem;
        }

        input, p-multiselect, p-select, p-datepicker{
            background: #EBFEFF;
            color: #000;
            padding: .55rem .7rem;
            border-radius: .4rem;
            width: 100%;
            box-sizing: border-box;
            min-height: 42px;
        }

        :host ::ng-deep .p-multiselect,
        :host ::ng-deep .p-select,
        :host ::ng-deep .p-datepicker {
            display: flex;
            align-items: center;
            height: 42px !important;
        }

        :host ::ng-deep p-datepicker .p-inputtext {
            background: #EBFEFF;
            border: none;
            width: 100%;
        }

        label { display: flex; }

        .actions.full {
            grid-column: 1 / -1;
            display: flex;
            justify-content: center;
            margin-top: 1rem;
        }

        .btn {
            border: 0;
            padding: .6rem 1rem;
            border-radius: .5rem;
            background: var(--header-cyan, #00BFFF);
            color: #fff;
            font-weight: 500;
            font-size: var(--h6, 1rem);
            cursor: pointer;
        }

        @media (max-width: 1024px) {
            .grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 600px) {
            .grid { grid-template-columns: 1fr; }
            .btn { width: 100%; }
        }
    `]
})
export class SaleFormComponent {
  @Input() value: Partial<Sale> | null = null;
  @Output() submit = new EventEmitter<SaleFormValue>();
  @Output() cancel = new EventEmitter<void>();

  customerOptions: CustomerSummary[] = [];
  locationOptions: Locationsummary[] = [];
  saleStatusOptions: SaleStatusSummary[] = [];
  inventoryProductsOptions: Inventory[] = [];

  suggestions: Record<number, any[]> = {};
  displayProducts: Record<number, any> = {};
  meta: Record<number, { stock?: number }> = {};
  
  form!: FormGroup;

  constructor(
    private fb: NonNullableFormBuilder,
    private customersService: CustomersService,
    private locationsService: LocationsService,
    private saleStatusesService: SaleStatusesService,
    private inventoriesService: InventoriesService,
  ) {}

  get saleItems() { 
    return this.form.get('saleItems') as FormArray<FormGroup>;
  }

  ngOnInit() {
    this.loadCustomerOptions();
    this.loadLocationOptions();
    this.loadSaleStatusOptions();

    this.form = this.fb.group({
      registrationDate: this.fb.control('', { validators: [Validators.required] }),
      customer: this.fb.control<number | null>(null, { validators: [Validators.required] }),
      saleStatus: this.fb.control<number | null>(null, { validators: [Validators.required] }),
      location: this.fb.control<number | null>(null, { validators: [Validators.required] }),
      saleItems: this.fb.array<FormGroup>([])
    });

    if (this.value) this.patchFromValue(this.value);
  }

  ngOnChanges(){
    if (!this.form || !this.value) return;
    this.setValueFromSale(this.value as Sale);
  }

  private setValueFromSale(sale: Sale) {
    function toLocalDate(iso: string | Date | null): Date | null {
        if (!iso) return null;
        if (iso instanceof Date) return iso;
        const [y, m, d] = (iso as string).split('-').map(Number);
        return new Date(y, (m ?? 1) - 1, d ?? 1);
    }

    this.form.patchValue({
        registrationDate: toLocalDate(sale.registrationDate),
        customer: sale.customer?.customerId ?? null,
        saleStatus: sale.saleStatus?.saleStatusId ?? null,
    }, { emitEvent: false });

    const items = (sale.saleItems ?? (sale as any).items) || [];
    const firstInventory = items[0]?.inventory;
    const locationId = firstInventory?.location?.locationId ?? null;
    
    this.form.get('location')!.setValue(locationId, { emitEvent: false });

    if (locationId) {
        this.loadInventoryProductsOptions(locationId);
        this.buildRowsAfterOptionsLoad = () => this.hydrateItems(sale);
    } else {
        this.hydrateItems(sale);
    }
  }

  private buildRowsAfterOptionsLoad: (() => void) | null = null;

  private hydrateItems(sale: Sale) {
    this.saleItems.clear();

    const items = (sale.saleItems ?? (sale as any).items) || [];
    items.forEach((d: any, idx: number) => {
        const inventoryId = d.inventory?.inventoryId ?? null;
        const productId   = d.inventory?.product?.productId ?? d.product?.productId ?? null;
        const unitPrice   = Number(d.unitPrice ?? 0);
        const qty         = Number(d.productQuantity ?? d.qty ?? 0);

        const g = this.fb.group({
            saleDetailId:       this.fb.control<number>(d.saleDetailId ?? 0),
            inventory:          this.fb.control<number | null>(inventoryId, { validators: [Validators.required] }),
            productId:          this.fb.control<number | null>(productId,   { validators: [Validators.required] }),
            productQuantity:    this.fb.control<number>(qty,       { validators: [Validators.required, Validators.min(1)] }),
            unitPrice:          this.fb.control<number>(unitPrice, { validators: [Validators.required, Validators.min(0)] }),
            subTotal:           this.fb.control<number>({ value: qty * unitPrice, disabled: true } as any),
        });

        g.valueChanges.subscribe(() => this.recalcGroup(g));
        this.saleItems.push(g);

        this.meta[idx] = { stock: Number(d.inventory?.currentStock ?? d.currentStock ?? 0) };
    });
  }

  private loadCustomerOptions() {
    this.customersService.customerSummayList().subscribe({
        next: (data) => {
            if (data) {
                this.customerOptions = (data || []).map(c => ({
                    ...c,
                    displayLabel: `${c.name} ${c.paternalSurname ?? ''} ${c.maternalSurname ?? ''}`.trim()
                }));
            } else {
                this.customerOptions = [];
            }
        },
        error: (e) => {
        console.error('Error al cargar clientes:', e);
        this.customerOptions = [];
        }
    });
  }

  private loadLocationOptions() {
    this.locationsService.locationsSummaryList().subscribe({
        next: (data) => {
            if (data) {
                this.locationOptions = (data || []).map(l => ({
                    ...l,
                    displayLabel: `${l.code} - ${l.name}`
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

  private loadSaleStatusOptions() {
    this.saleStatusesService.saleStatusesList().subscribe({
        next: (data) => {
            if (data) {
                this.saleStatusOptions = data;
            } else {
                this.saleStatusOptions = [];
            }
        }
    })
  }

  private loadInventoryProductsOptions(locationId: number) {
    this.inventoriesService.inventoryByLocation(locationId).subscribe({
        next: (data) => {
            if (data) {
                this.inventoryProductsOptions = (data || []).map(i => ({
                    ...i,
                    displayLabel: `${i.product?.name ?? ''}`
                }));
                if (this.buildRowsAfterOptionsLoad) {
                    const fn = this.buildRowsAfterOptionsLoad;
                    this.buildRowsAfterOptionsLoad = null;
                    fn();
                }
            } else {
                this.inventoryProductsOptions = [];
            }
        },
        error: () => { this.inventoryProductsOptions = []; }
    })
  }

  handleLocationChange(locationId: number) {
    this.onLocationChange();
    if (locationId) {
        this.loadInventoryProductsOptions(locationId);
    } else {
        this.inventoryProductsOptions = [];
    }
  }

  handleInventoryChange(inventoryId: number, rowIndex: number) {
    const inventory = this.inventoryProductsOptions.find(x => x.inventoryId === inventoryId);
    const g = this.saleItems.at(rowIndex) as FormGroup;
    if (!inventory || !g) return;

    g.patchValue({
        unitPrice: Number(inventory.product?.suggestedPrice) || 0
    }, { emitEvent: true });

    this.meta[rowIndex] = { stock: Number(inventory.currentStock) || 0 };

    if(!g.get('productId')) {
        g.addControl('productId', this.fb.control<number | null>( null, {validators: [Validators.required]} ));
    }
    g.get('productId')!.setValue(inventory.product?.productId ?? null, { emitEvent: true });
  }

  onLocationChange() {
    if (this.saleItems.length) {
        this.saleItems.clear();
        this.suggestions = {};
        this.displayProducts = {};
        this.meta = {};
    }
  }

  addItem() {
    const g = this.fb.group({
        inventory: this.fb.control<number | null>(null, { validators: [Validators.required] }),
        productQuantity: this.fb.control<number | null>(null, { validators: [Validators.required] }),
        unitPrice: this.fb.control<number | null>(1, { validators: [Validators.required] }),
        subTotal: this.fb.control<number | null>({ value: 0, disabled: true } as any),
        productId: this.fb.control<number | null>(null, { validators: [Validators.required] })
    });
    g.valueChanges.subscribe(() => this.recalcGroup(g));
    this.saleItems.push(g);
  }

  cloneRow(i: number) {
    const val = this.saleItems.at(i).getRawValue();
    const g = this.fb.group({
        inventory: this.fb.control<number | null>(val.inventory, { validators: [Validators.required] }),
        productQuantity: this.fb.control<number>(val.productQuantity ?? 1, { validators: [Validators.required, Validators.min(1)] }),
        unitPrice: this.fb.control<number>(val.unitPrice ?? 0, { validators: [Validators.required, Validators.min(0)] }),
        subTotal: this.fb.control<number>({ value: val.productQuantity * val.unitPrice, disabled: true } as any)
    });
    g.valueChanges.subscribe(() => this.recalcGroup(g));
    this.saleItems.insert(i + 1, g);
    this.displayProducts[i + 1] = this.displayProducts[i];
    this.meta[i + 1] = this.meta[i];
  }

  removeRow(i: number) {
    delete this.suggestions[i];
    delete this.displayProducts[i];
    delete this.meta[i];
    this.saleItems.removeAt(i);
  }

  searchProducts(ev: any, rowIndex: number) {
    const q = (ev?.query || '').trim();
    const location = this.form.value.location;
    if (!location) return;

    this.inventoriesService.inventoryByLocation(Number(location)).subscribe(rows => {
        const mapped = rows.map(p => ({
            ...p,
            display: `${p.product.name}`,
        }));
        this.suggestions[rowIndex] = mapped;
    });
  }

  selectProduct(ev: any, rowIndex: number) {
    const sel: SaleItem = ev as SaleItem;
    const g = this.saleItems.at(rowIndex) as FormGroup;
    g.patchValue({
        inventory: sel.inventory,
        product: sel.inventory.product,
        unitPrice: sel.unitPrice
    }, { emitEvent: true });
    this.meta[rowIndex] = { stock: sel.productQuantity };
  }

  private recalcGroup(g: FormGroup) {
    const productQuantity = Number(g.get('productQuantity')!.value || 0);
    const unitPrice = Number(g.get('unitPrice')!.value || 0);
    const subTotal = productQuantity * unitPrice;
    g.get('subTotal')!.setValue(subTotal, { emitEvent: false });
  }

  recalcRow(i: number) {
    this.recalcGroup(this.saleItems.at(i) as FormGroup);
  }

  subtotalOf(i: number) {
    return Number((this.saleItems.at(i) as FormGroup).get('subTotal')!.value || 0);
  }

  total() {
    return this.saleItems.controls.reduce((acc, g) => acc + (Number(g.get('subTotal')!.value) || 0), 0);
  }

  stockError(i: number) {
    const s = this.meta[i]?.stock;
    const productQuantity = Number((this.saleItems.at(i) as FormGroup).get('productQuantity')!.value || 0);
    return Number.isFinite(s as number) && productQuantity > (s as number);
  }

  anyStockError() {
    return this.saleItems.controls.some((_, i) => this.stockError(i));
  }

  private patchFromValue(s: Partial<Sale>){
    this.form.patchValue({
        registrationDate: s.registrationDate ?? '',
        customer: s.customer?.customerId ?? null,
        saleStatus: s.saleStatus?.saleStatusId ?? null,
        location: null
    });
  }

  formatMoney(n: number) {
    return `Bs. ${ (n || 0).toFixed(2) }`;
  }

  save(){
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saleItems.length === 0 || this.anyStockError()) return;

    const dto = this.form.getRawValue() as SaleFormValue;
    console.log('Formulario de venta ', dto);

    this.submit.emit(dto);
  }

  reset() {
    this.saleItems.clear();
    this.form.reset({ registrationDate: new Date().toISOString().slice(0, 10) });
    this.suggestions = {};
    this.displayProducts = {};
    this.meta = {};
  }
}