import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Inventory } from "./inventories.types";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabelModule } from "primeng/floatlabel";
import { SelectModule } from "primeng/select";
import { MultiSelectModule } from "primeng/multiselect";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Locationsummary } from "../locations/locations.types";
import { ProductSummary } from "../products/products.types";
import { LocationsService } from "../locations/locations.service";
import { ProductsService } from "../products/products.service";
import { MessageService } from "primeng/api";
import { MessageModule } from "primeng/message";
import { InputNumberModule } from "primeng/inputnumber";
import { InventoriesService } from "./inventories.service";

export type InventoryFormValue = Omit<Inventory, 'inventoryId'>

@Component({
  selector: 'inventory-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    FloatLabelModule,
    SelectModule,
    MultiSelectModule,
    MessageModule,
    InputNumberModule
  ],
  template: `
    <form [formGroup]="form" class="grid">
      <div class="field">
        <p-floatlabel variant="on">
          <p-inputnumber 
            id="currentStock" 
            formControlName="currentStock" 
            autocomplete="off" 
            mode="decimal"
            [maxFractionDigits]="0"
            [min]="0"
          />
          <label for="currentStock">Stock Actual*</label>
        </p-floatlabel>
        @if (isInvalid('currentStock')) {
          @if (this.form.get('currentStock')?.errors?.['required']) {
            <p-message
              severity="error"
              size="small"
              variant="simple"
            >Campo requerido.</p-message>
          }
          @if (this.form.get('currentStock')?.errors?.['min']) {
            <p-message
              severity="error"
              size="small"
              variant="simple"
            >El valor mínimo debe ser 0.</p-message>
          }
        }
      </div>

      <div class="field">
        <p-floatlabel variant="on">
          <p-inputnumber 
            id="minimumStock" 
            formControlName="minimumStock" 
            autocomplete="off" 
            mode="decimal"
            [maxFractionDigits]="0"
            [min]="0"
          />
          <label for="minimumStock">Stock Minimo</label>
        </p-floatlabel>
        @if (isInvalid('minimumStock')) {
          @if (this.form.get('minimumStock')?.errors?.['min']) {
            <p-message
              severity="error"
              size="small"
              variant="simple"
            >El valor mínimo debe ser 0.</p-message>
          }
        }
      </div>
    
      <div class="field">
        <p-floatlabel variant="on">
          <p-select
              id="location"
              formControlName="location"
              [options]="locationOptions"
              optionLabel="name"
              optionValue="locationId"
              appendTo="body"
              [filter]="true"
          />
          <label for="location">Ubicación*</label>
        </p-floatlabel>
        @if (isInvalid('location')) {
          <p-message
            severity="error"
            size="small"
            variant="simple"
          >Campo requerido.</p-message>
        }
      </div>

      <div class="field">
        <p-floatlabel variant="on">
          <p-select
              id="product"
              formControlName="product"
              [options]="productOptions"
              optionLabel="name"
              optionValue="productId"
              appendTo="body"
              [filter]="true"
              [optionDisabled]="'disabled'"
          />
          <label for="product">Producto*</label>
        </p-floatlabel>
        @if (isInvalid('product')) {
          <p-message
            severity="error"
            size="small"
            variant="simple"
          >Campo requerido.</p-message>
        }
      </div>
    </form>

    <div class="actions full">
      <button 
        type="button" 
        class="btn" 
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

    input, p-multiselect, p-select, p-inputnumber {
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
    :host ::ng-deep .p-inputnumber {
      display: flex;
      align-items: center;
      height: 42px !important;
    }

    :host ::ng-deep p-inputnumber .p-inputtext {
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
export class InventoryFormComponent {
  @Input() value: Partial<Inventory> | null = null;
  @Output() submit = new EventEmitter<InventoryFormValue>();
  @Output() cancel = new EventEmitter<void>();

  locationOptions: Locationsummary[] = [];
  productOptionsAll: ProductSummary[] = [];
  productOptions: ProductSummary[] = [];
  inventoryOptions: Inventory[] = [];
  
  form!: FormGroup;

  formSubmitted = false;

  constructor(
    private fb: NonNullableFormBuilder,
    private locationsService: LocationsService,
    private productsService: ProductsService,
    private messageService: MessageService,
    private inventoriesService: InventoriesService
  ) {}

  ngOnInit() {
    this.loadLocationOptions();
    this.loadProductOptions();

    this.form = this.fb.group({
      currentStock: this.fb.control('', { validators: [Validators.required, Validators.min(0)] }),
      minimumStock: this.fb.control('', { validators: [Validators.min(0)] }),
      product: this.fb.control<number | null>(null, { validators: [Validators.required] }),
      location: this.fb.control<number | null>(null, { validators: [Validators.required] }),
    });

    if (this.value) {
      this.patchFromValue(this.value);
      this.loadProductsByLocation(this.value?.location?.locationId ?? 0);
    };

    this.form.get('location')!.valueChanges.subscribe(locationId => {
      if (!locationId) {
        this.productOptions = [...this.productOptionsAll];
        this.form.patchValue({ product: null }, { emitEvent: false });

        return;
      }

      this.form.get('product')!.patchValue(null, { emitEvent: false });

      this.loadProductsByLocation(locationId);
    })
  }

  ngOnChanges(){
    if (!this.form || !this.value) return;
    this.patchFromValue(this.value);
  }

  private loadLocationOptions() {
    this.locationsService.locationsSummaryList().subscribe({
      next: (data) => {
        if (data) {
          this.locationOptions = data;
        } else {
          this.locationOptions = [];
        }
      }
    })
  }

  private loadProductOptions() {
    this.productsService.productSummayList().subscribe({
      next: (data) => {
        if (data) {
          this.productOptionsAll = data ?? [];
          this.productOptions = [...this.productOptionsAll];
        } else {
          this.productOptionsAll = [];
          this.productOptions = [];
        }
      },
      error: (e) => {
        console.error('Error al cargar el resumen de categorías: ', e);
        this.locationOptions = [];
      }
    });
  }

  private loadProductsByLocation(locationId: number) {
    this.inventoriesService.inventoryByLocation(locationId).subscribe({
      next: (data) => {
          this.inventoryOptions = data ?? [];

          const currentProductId = this.value?.product?.productId;

          const usedProductIds = new Set(
            this.inventoryOptions
              .map(i => i.product?.productId)
              .filter((id): id is number => id !== null && id !== currentProductId)
          );

          this.productOptions = this.productOptionsAll.map(p => ({
            ...p,
            disabled: usedProductIds.has(p.productId)
          }) as ProductSummary & { disabled?: boolean })
      },
      error: (e) => {
        console.error('Error al cargar inventarios activos por ubicación: ', e);
        this.inventoryOptions = [];
        this.productOptions = [...this.productOptionsAll];
      }
    })
  }

  private patchFromValue(v: Partial<Inventory>){
    this.form.patchValue({
        currentStock: v.currentStock,
        minimumStock: v.minimumStock,
        product: v.product?.productId,
        location: v.location?.locationId
    });
  }

  save(){
    this.formSubmitted = true;

    this.form.markAllAsTouched();
    
    if (this.form.invalid) {
      this.messageService.add({
        severity: 'info',
        summary: 'Completar Campos',
        detail: 'Debe completar todos los campos correctamente.',
      });

      return;
    }

    const dto = this.form.getRawValue() as InventoryFormValue;
    this.submit.emit(dto);

    this.formSubmitted = false;
  }

  isInvalid(controlName: string) {
    const control = this.form.get(controlName);
    return control?.invalid && (control.touched || this.formSubmitted);
  }
}