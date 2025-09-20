import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip'

export interface ColumnDef {
  field: string;
  header: string;
  sortable?: boolean;
}

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    TooltipModule
  ],
  template: `
    <p-table #dt
             [value]="data"
             [columns]="columns"
             [paginator]="true"
             [rows]="rows"
             [rowsPerPageOptions]="[5,10,25,50]"
             [totalRecords]="totalRecords ?? data?.length ?? 0"
             [lazy]="lazy"
             [loading]="loading"
             [globalFilterFields]="columns?.map(c => c.field)"
             (onPage)="onPageChange($event)"
             (onSort)="onSort($event)">
      
      <ng-template pTemplate="caption">
        <div class="table-caption">
          <div class="left">
            <span class="rows-label">Mostrar</span>
            <select class="rows-select" [ngModel]="rows" (ngModelChange)="onRowsChange($event)">
              <option [ngValue]="5">5</option>
              <option [ngValue]="10">10</option>
              <option [ngValue]="25">25</option>
              <option [ngValue]="50">50</option>
            </select>
            <span>filas</span>
          </div>

          <div class="right">
            <span class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <input pInputText type="text" (input)="dt.filterGlobal(($event.target as HTMLInputElement).value, 'contains')" placeholder="Buscar...">
            </span>
            <button pButton label="Agregar" icon="pi pi-plus" class="p-button-success" (click)="onAdd()"></button>
          </div>
        </div>
      </ng-template>

      <ng-template pTemplate="header" let-columns>
        <tr>
          <th *ngFor="let col of columns" [pSortableColumn]="col.sortable ? col.field : null">
            {{ col.header }}
            <p-sortIcon *ngIf="col.sortable" [field]="col.field"></p-sortIcon>
          </th>
          <th class="actions-col">Acciones</th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-rowData let-columns="columns">
        <tr>
          <td *ngFor="let col of columns">{{ rowData?.[col.field] }}</td>
          <td class="actions-col">
            <button pButton icon="pi pi-eye" class="p-button-text" (click)="onView(rowData)" pTooltip="Ver"></button>
            <button pButton icon="pi pi-pencil" class="p-button-text p-button-success" (click)="onEdit(rowData)" pTooltip="Editar"></button>
            <button pButton icon="pi pi-trash" class="p-button-text p-button-danger" (click)="onDelete(rowData)" pTooltip="Eliminar"></button>
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td [attr.colspan]="(columns?.length ?? 0) + 1">
            No hay datos.
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="paginatorleft" let-state>
        Mostrando {{ state.first + 1 }} – {{ Math.min(state.first + state.rows, state.totalRecords) }}
        de {{ state.totalRecords }} registros
      </ng-template>
    </p-table>
  `
})

export class DataTableComponent {
  @Input() data: any[] = [];
  @Input() columns: ColumnDef[] = [];
  @Input() rows = 10;
  @Input() totalRecords?: number;
  @Input() lazy = false;
  @Input() loading = false;

  @Output() addEvent = new EventEmitter<void>();
  @Output() editEvent = new EventEmitter<any>();
  @Output() deleteEvent = new EventEmitter<any>();
  @Output() viewEvent = new EventEmitter<any>();
  @Output() pageEvent = new EventEmitter<any>();
  @Output() sortEvent = new EventEmitter<any>();
  @Output() rowsChange = new EventEmitter<number>();

  onAdd() { this.addEvent.emit(); }
  onEdit(row: any) { this.editEvent.emit(row); }
  onDelete(row: any) { this.deleteEvent.emit(row); }
  onView(row: any) { this.viewEvent.emit(row); }
  onPageChange(e: any) { this.pageEvent.emit(e); }
  onSort(e: any) { this.sortEvent.emit(e); }
  onRowsChange(n: number) {
    this.rows = n;
    this.rowsChange.emit(n);
  }
}
