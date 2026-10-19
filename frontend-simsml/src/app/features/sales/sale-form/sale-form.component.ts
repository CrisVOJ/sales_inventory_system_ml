import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Sale } from "../sales.types";
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators, FormsModule, FormArray } from "@angular/forms";
import { InputNumberModule } from "primeng/inputnumber";
import { FloatLabelModule } from "primeng/floatlabel";
import { SelectModule } from "primeng/select";
import { CustomersService } from "../../customers/customers.service";
import { CustomerSummary } from "../../customers/customers.types";
import { DatePickerModule } from "primeng/datepicker";
import { LocationSummary } from "../../locations/locations.types";
import { LocationsService } from "../../locations/locations.service";
import { SaleStatusSummary } from "../sale-statuses/sale-statuses.types";
import { SaleStatusesService } from "../sale-statuses/sale-statuses.service";
import { CommonModule } from "@angular/common";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { InventoriesService } from "../../inventories/inventories.service";
import { Inventory } from "../../inventories/inventories.types";
import { MessageService } from "primeng/api";
import { MessageModule } from "primeng/message";

export type SaleFormValue = Omit<Sale, 'saleId'>;

@Component({
    selector: 'sale-form',
    standalone: true,
    templateUrl: './sale-form.component.html',
    styleUrls: ['./sale-form.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputNumberModule,
        FloatLabelModule,
        SelectModule,
        DatePickerModule,
        TableModule,
        ButtonModule,
        FormsModule,
        MessageModule
    ]
})
export class SaleFormComponent {
  @Input() value: Partial<Sale> | null = null;
  @Output() submit = new EventEmitter<SaleFormValue>();
  @Output() cancel = new EventEmitter<void>();

  customerOptions: CustomerSummary[] = [];
  locationOptions: LocationSummary[] = [];
  saleStatusOptions: SaleStatusSummary[] = [];
  inventoryProductsOptions: Inventory[] = [];

  meta: Record<number, { stock?: number }> = {};
  
  form!: FormGroup;

  formSubmitted = false;

  editing = false;

  constructor(
    private fb: NonNullableFormBuilder,
    private customersService: CustomersService,
    private locationsService: LocationsService,
    private saleStatusesService: SaleStatusesService,
    private inventoriesService: InventoriesService,
    private messageService: MessageService
  ) {}

  get saleItems() { 
    return this.form.get('saleItems') as FormArray<FormGroup>;
  }

  ngOnInit() {
    const today = this.today();
    this.registrationMinDate = today;

    this.form = this.fb.group({
      registrationDate: this.fb.control<Date | null>(today, { validators: [Validators.required] }),
      customer: this.fb.control<number | null>(null, { validators: [Validators.required] }),
      saleStatus: this.fb.control<number | null>(2, { validators: [Validators.required] }),
      location: this.fb.control<number | null>(null, { validators: [Validators.required] }),
      saleItems: this.fb.array<FormGroup>([])
    });

    if (this.value) {
        this.editing = true;
        this.setValueFromSale(this.value as Sale);
    } else {
        this.editing = false;
        this.form.patchValue(
            { registrationDate: this.today() },
            { emitEvent: false }
        )
    }

    this.loadCustomerOptions();
    this.loadLocationOptions();
    this.loadSaleStatusOptions();
  }

  ngOnChanges(){
    if (!this.form || !this.value) return;

    if (this.value && this.value.saleId) {
        this.editing = true;
        this.setValueFromSale(this.value as Sale);
    } else {
        this.editing = false;
        this.form.patchValue(
        { registrationDate: this.today() },
        { emitEvent: false }
        );
        this.saleItems.clear();
        this.meta = {};
    }
  }

  private today(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }

  registrationMinDate: Date | null = null;

  private toLocalDate(iso: string | Date | null): Date | null {
    if (!iso) return null;
    if (iso instanceof Date) return iso;

    const [year, month, day] = iso.split('-').map(Number);
    if (!year || !month || !day) return null;

    return new Date(year, month - 1, day);
  }

  private setValueFromSale(sale: Sale) {
    this.form.patchValue({
        registrationDate: this.toLocalDate(sale.registrationDate),
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

        const g = this.createSaleItemGroup({
            saleDetailId: d.saleDetailId ?? 0,
            inventoryId,
            productId,
            quantity: qty,
            unitPrice,
        });

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

    if (this.hasInventoryDuplicate(inventoryId, rowIndex)) {
        const control = g.get('inventory');
        const prevErrors = control?.errors || {};
        control?.setErrors({ ...prevErrors, duplicate: true });

        this.messageService.add({
            severity: 'warn',
            summary: 'Producto repetido',
            detail: 'Este producto ya fue agregado a la venta.'
        });
    } else {
        this.clearInventoryDuplicateError(rowIndex);
    }

    g.patchValue({
        unitPrice: Number(inventory.product?.suggestedPrice) || 0
    }, { emitEvent: true });

    this.meta[rowIndex] = { stock: Number(inventory.currentStock) || 0 };

    if(!g.get('productId')) {
        g.addControl('productId', this.fb.control<number | null>( null, {validators: [Validators.required]} ));
    }
    g.get('productId')!.setValue(inventory.product?.productId ?? null, { emitEvent: true });
  }

  isRowInvalid(index: number, controlName: string) {
    const row = this.saleItems.at(index) as FormGroup;
    const control = row.get(controlName);
    return control?.invalid && (control.touched || this.formSubmitted);
  }

  getRowErrors(index: number, controlName: string) {
    const row = this.saleItems.at(index) as FormGroup;
    const control = row.get(controlName);
    return control?.errors || null;
  }


  onLocationChange() {
    if (this.saleItems.length) {
        this.saleItems.clear();
        this.meta = {};
    }
  }

  addItem() {
    this.saleItems.push(this.createSaleItemGroup());
  }

  removeRow(i: number) {
    delete this.meta[i];
    this.saleItems.removeAt(i);
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

  formatMoney(n: number) {
    return `Bs. ${ (n || 0).toFixed(2) }`;
  }

  private hasInventoryDuplicate(inventoryId: number, rowIndex: number): boolean {
    return this.saleItems.controls.some((ctrl, i) => 
        i !== rowIndex && ctrl.get('inventory')?.value === inventoryId
    )
  }

  private clearInventoryDuplicateError(rowIndex: number) {
    const c = this.saleItems.at(rowIndex).get('inventory');
    if (!c) return;

    const errors = { ...(c.errors || {}) };
    delete errors['duplicate'];

    const hasOtherErrors = Object.keys(errors).length > 0;
    c.setErrors(hasOtherErrors ? errors : null);
  }

  save(){
    this.formSubmitted = true;

    this.form.markAllAsTouched();

    const hasItems = this.saleItems.length > 0;
    const hasStockErr = this.anyStockError();

    if (this.form.invalid || !hasItems || this.anyStockError()) {
        this.messageService.add({
            severity: 'info',
            summary: 'Completar Campos',
            detail: !hasItems 
                ? 'Debe agregar al menos un producto.'
                : hasStockErr 
                    ? 'Hay cantidades que superan el stock disponible.'
                    : 'Debe completar todos los campos correctamente.'
        });

        return;
    }

    const dto = this.form.getRawValue() as SaleFormValue;
    this.submit.emit(dto);

    this.formSubmitted = false;
  }

  reset() {
    this.saleItems.clear();
    this.form.reset({ registrationDate: this.registrationMinDate ?? this.today() });
    this.meta = {};
  }

  private createSaleItemGroup(initial?: {
    saleDetailId?: number;
    inventoryId?: number | null;
    productId?: number | null;
    quantity?: number;
    unitPrice?: number;
  }): FormGroup {
    const qty = initial?.quantity ?? 1;
    const price = initial?.unitPrice ?? 0;

    const g = this.fb.group({
        saleDetailId: this.fb.control<number>(initial?.saleDetailId ?? 0),
        inventory: this.fb.control<number | null>(initial?.inventoryId ?? null, 
            { validators: [Validators.required] }
        ),
        productId: this.fb.control<number | null>(initial?.productId ?? null, 
            { validators: [Validators.required] }
        ),
        productQuantity: this.fb.control<number>(qty, 
            { validators: [Validators.required, Validators.min(1)] }
        ),
        unitPrice: this.fb.control<number>(price, 
            { validators: [Validators.required, Validators.min(0)] }
        ),
        subTotal: this.fb.control<number>({ value: qty * price, disabled: true } as any),
    });

    g.valueChanges.subscribe(() => this.recalcGroup(g));

    return g;
  }

  isInvalid(controlName: string) {
    const control = this.form.get(controlName);
    return control?.invalid && (control.touched || this.formSubmitted);
  }
}