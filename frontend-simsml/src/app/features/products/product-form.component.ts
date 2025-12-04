import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Product } from './products.types';

import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect'

import { CategoriesService } from '../categories/categories.service';
import { CategorySummary } from '../categories/categories.types';
import { UnitsService } from '../units/units.service';
import { Unit } from '../units/units.types';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber';

export type ProductFormValue = Omit<Product, 'productId'>;

@Component({
  selector: 'product-form',
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
          <input pInputText id="name" formControlName="name" autocomplete="off"/>
          <label for="name">Nombre*</label>
        </p-floatlabel>
        @if (isInvalid('name')) {
          <p-message
            severity="error"
            size="small"
            variant="simple"
          >Campo requerido.</p-message>
        }
      </div>

      <div class="field">
        <p-floatlabel variant="on">
          <input pInputText id="description" formControlName="description" autocomplete="off"/>
          <label for="description">Descripción</label>
        </p-floatlabel>
      </div>

      <div class="field">
        <p-floatlabel variant="on">
          <input pInputText id="code" formControlName="code" autocomplete="off"/>
          <label for="code">Código*</label>
        </p-floatlabel>
        @if (isInvalid('code')) {
          <p-message
            severity="error"
            size="small"
            variant="simple"
          >Campo requerido.</p-message>
        }
      </div>

      <div class="field">
        <p-floatlabel variant="on">
          <p-inputnumber 
            id="suggestedPrice" 
            formControlName="suggestedPrice" 
            autocomplete="off" 
            mode="decimal"
            [minFractionDigits]="0"
            [maxFractionDigits]="2"
            [min]="0"
          />
          <label for="suggestedPrice">Precio Recomendado*</label>
        </p-floatlabel>
        @if (isInvalid('suggestedPrice')) {
          @if (this.form.get('suggestedPrice')?.errors?.['required']) {
            <p-message
              severity="error"
              size="small"
              variant="simple"
            >Campo requerido.</p-message>
          }
          @if (this.form.get('suggestedPrice')?.errors?.['min']) {
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
              id="unit"
              formControlName="unit"
              [options]="unitOptions"
              optionLabel="name"
              optionValue="unitId"
              appendTo="body"
              [filter]="true"
          />
          <label for="unit">Unidad*</label>
        </p-floatlabel>
        @if (isInvalid('unit')) {
          <p-message
            severity="error"
            size="small"
            variant="simple"
          >Campo requerido.</p-message>
        }
      </div>

      <div class="field">
        <p-floatlabel variant="on">
          <p-multiselect
            id="categories"
            formControlName="categories"
            [options]="categoryOptions"
            optionLabel="name"
            optionValue="categoryId"
            display="chip"
            appendTo="body"
            panelStyleClass="multiselect-panel"
          />
          <label for="categories">Categoría*</label>
        </p-floatlabel>
        @if (isInvalid('categories')) {
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
export class ProductFormComponent {
  @Input() value: Partial<Product> | null = null;
  @Output() submit = new EventEmitter<ProductFormValue>();
  @Output() cancel = new EventEmitter<void>();

  categoryOptions: CategorySummary[] = [];
  unitOptions: Unit[] = [];
  
  form!: FormGroup;

  formSubmitted = false;

  constructor(
    private fb: NonNullableFormBuilder,
    private categoriesService: CategoriesService,
    private unitsService: UnitsService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadCategoryOptions();
    this.loadUnitOptions();

    this.form = this.fb.group({
      name: this.fb.control('', { validators: [Validators.required] }),
      description: this.fb.control(''),
      code: this.fb.control('', { validators: [Validators.required] }),
      suggestedPrice: this.fb.control('', { validators: [Validators.required, Validators.min(0)] }),
      unit: this.fb.control<number | null>(null, { validators: [Validators.required] }),
      categories: this.fb.control<number[]>([], { validators: [Validators.required] }),
    });

    if (this.value) this.patchFromValue(this.value);
  }

  ngOnChanges(){
    if (!this.form || !this.value) return;
    this.patchFromValue(this.value);
  }

  private loadCategoryOptions() {
    this.categoriesService.categoriesSummaryList().subscribe({
      next: (data) => {
        if (data) {
          this.categoryOptions = data;
        } else {
          this.categoryOptions = [];
        }
      },
      error: (e) => {
        console.error('Error al cargar el resumen de categorías: ', e);
        this.categoryOptions = [];
      }
    });
  }

  private loadUnitOptions() {
    this.unitsService.getUnits('', true).subscribe({
      next: (data) => {
        if (data) {
          this.unitOptions = data;
        } else {
          this.unitOptions = [];
        }
      }
    })
  }

  private patchFromValue(v: Partial<Product>){
    this.form.patchValue({
      name: v.name,
      description: v.description ?? '',
      code: v.code,
      suggestedPrice: v.suggestedPrice,
      active: v.active ?? true,
      unit: v.unit?.unitId,
      categories: Array.isArray(v.categories) 
        ? v.categories.map((c: CategorySummary) => c.categoryId)
        : [],
    });
    console.log(this.form.value);
  }

  save(){
    this.formSubmitted = true;

    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.messageService.add({
        severity: 'info',
        summary: 'Completar Campos',
        detail: 'Debe completar todos los campos correctamente.',
      })

      return;
    };

    const dto = this.form.getRawValue() as ProductFormValue;
    this.submit.emit(dto);

    this.formSubmitted = false;
  }

  isInvalid(controlName: string) {
    const control = this.form.get(controlName);
    return control?.invalid && (control.dirty || control.touched || this.formSubmitted);
  }
}
