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

export type InventoryFormValue = Omit<Inventory, 'inventoryId'>

@Component({
  selector: 'inventory-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    FloatLabelModule,
    SelectModule,
    MultiSelectModule
  ],
  template: `
    <form [formGroup]="form" class="grid">
    
      <p-floatlabel variant="on">
        <input pInputText id="currentStock" formControlName="currentStock" autocomplete="off"/>
        <label for="currentStock">Stock Actual*</label>
      </p-floatlabel>

      <p-floatlabel variant="on">
        <input pInputText id="minimumStock" formControlName="minimumStock" autocomplete="off"/>
        <label for="minimumStock">Stock Minimo</label>
      </p-floatlabel>

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

      <p-floatlabel variant="on">
        <p-select
            id="product"
            formControlName="product"
            [options]="productOptions"
            optionLabel="name"
            optionValue="productId"
            appendTo="body"
            [filter]="true"
        />
        <label for="product">Producto*</label>
      </p-floatlabel>

    </form>

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

    input, p-multiselect, p-select {
      background: #EBFEFF;
      color: #000;
      padding: .55rem .7rem;
      border-radius: .4rem;
      width: 100%;
      box-sizing: border-box;
      min-height: 42px;
    }

    :host ::ng-deep .p-multiselect, :host ::ng-deep .p-select{
      display: flex;
      align-items: center;
      height: 42px !important;
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
  productOptions: ProductSummary[] = [];
  
  form!: FormGroup;

  constructor(
    private fb: NonNullableFormBuilder,
    private locationsService: LocationsService,
    private productsService: ProductsService
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

    if (this.value) this.patchFromValue(this.value);
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
          this.productOptions = data;
        } else {
          this.productOptions = [];
        }
      },
      error: (e) => {
        console.error('Error al cargar el resumen de categorías: ', e);
        this.locationOptions = [];
      }
    });
  }

  private patchFromValue(v: Partial<Inventory>){
    this.form.patchValue({
        currentStock: v.currentStock,
        minimumStock: v.minimumStock,
        product: v.product?.productId,
        location: v.location?.locationId
    });
    console.log(this.form.value);
  }

  save(){
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const dto = this.form.getRawValue() as InventoryFormValue;

    this.submit.emit(dto);
  }
}