import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip'

export interface CrudColumn<T = any> {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: 'left'|'center'|'right';
  format?: (row: T, index: number) => string;
}

export interface CrudAction<T = any> {
  id: string; // 'view' | 'edit' | 'delete'
  label: string;
  icon?: string;
  class?: 'primary' | 'ghost' | 'danger' | 'warn';
  show?: (row: T) => boolean;
  disabled?: (row: T) => boolean;
  tooltip?: (row: T) => string;
  color?: (row: T) => string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    ButtonModule,
    CommonModule,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    RippleModule,
    TooltipModule,
    TableModule,
    NgFor,
    NgIf
  ],
  styleUrls: ['./data-table.component.scss'],
  template: `
    <div class="table-content-bg">
      <!-- Toolbar -->
      <div class="toolbar">
        <div class="left">
          <div>
            <span style="font-size: var(--p);">Mostrar </span>
            <select class="select-box" [(ngModel)]="pageSize" (ngModelChange)="pageSizeChange(1)">
              <option [value]="5">5</option>
              <option [value]="10">10</option>
              <option [value]="15">15</option>
            </select>
          </div>
          <p-iconfield iconPosition="left" class="search">
            <p-inputicon class="pi pi-search" style="color: #00B4E0;"/>
            <input  pInputText type="search" 
                    [placeholder]="searchPlaceholder"
                    [(ngModel)]="query" 
                    (input)="onSearch.emit(query)" />
          </p-iconfield>
        </div>
        <div class="right">
          <button class="btn add" (click)="create.emit()">Agregar {{entityName}}</button>
        </div>
      </div>

      <!-- Tabla -->
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th *ngFor="let c of columns" 
                  [style.width]="c.width" 
                  [class.center]="c.align==='center'" 
                  [class.right]="c.align==='right'">
                {{ c.header }}
              </th>
              <th *ngIf="actions?.length" 
                  class="head-actions">
                  Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let row of rows; let i = index">
              <td *ngFor="let c of columns" 
                  [class.center]="c.align==='center'" 
                  [class.right]="c.align==='right'">
                {{ c.format ? c.format(row, i) : $any(row)[c.key] }}
              </td>

              <td *ngIf="actions?.length" class="actions">
                <div class="actions-container">
                  <ng-container *ngFor="let a of actions">
                    <button *ngIf="!a.show || a.show(row)"
                            class="act" [ngClass]="a.class || 'ghost'"
                            [title]="a.tooltip ? a.tooltip(row) : a.label"
                            [disabled]="a.disabled ? a.disabled(row) : false"
                            (click)="emitAction(a.id, row)"
                            pButton pRipple
                            [pTooltip]="a.tooltip ? a.tooltip(row) : a.label"
                            tooltipPosition="bottom"
                    >
                      <span class="pi" [class]="a.icon"
                            [style.color]="a.color ? a.color(row) : null"
                            >
                      </span>
                    </button>
                  </ng-container>
                </div>
              </td>
            </tr>

            <tr *ngIf="!rows?.length">
              <td [attr.colspan]="columns.length + 1" class="empty">Sin datos</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div class="pager" *ngIf="total > 0">
        <span class="hint">Mostrando {{startIndex()+1}} a {{endIndex()}} de {{total}} registros</span>
        <div>
          <button class="nav" (click)="pageSizeChange(1)" [disabled]="page<=1">«</button>
          <button class="nav" (click)="pageSizeChange(page-1)" [disabled]="page<=1">‹</button>

          <button *ngFor="let p of pages()" 
                  class="page" [class.isActive]="p===page" 
                  (click)="pageSizeChange(p)">{{p}}</button>
          
          <button class="nav" (click)="pageSizeChange(page+1)" [disabled]="page>=pageCount()">›</button>
          <button class="nav" (click)="pageSizeChange(pageCount())" [disabled]="page>=pageCount()">»</button>
        </div>
      </div>
    </div>
  `
})

export class DataTableComponent<T> {
  @Input() entityName = 'Registro';
  @Input() columns: CrudColumn<T>[] = [];
  @Input() rows: T[] = [];
  @Input() total = 0;
  @Input() page = 1;
  @Input() pageSize = 5;
  @Input() searchPlaceholder = 'Buscar...';
  @Input() actions: CrudAction<T>[] = [];
  
  // @Output() onCreate = new EventEmitter<void>();
  // @Output() onView = new EventEmitter<T>();
  // @Output() onEdit = new EventEmitter<T>();
  // @Output() onDelete = new EventEmitter<T>();
  // @Output() onPage = new EventEmitter<{page:number,pageSize:number}>();
  @Output() create = new EventEmitter<void>();
  @Output() onSearch = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<{page:number,pageSize:number}>();
  @Output() action = new EventEmitter<{id:string,row:T}>();

  query = '';

  pageCount(){ return Math.max(1, Math.ceil(this.total / this.pageSize)); }
  pages(){ return Array.from({length: this.pageCount()}, (_,i)=>i+1).slice(0, 6); }
  pageSizeChange(p:number){
    const np = Math.min(Math.max(1,p), this.pageCount());
    this.page = np;
    this.pageChange.emit({page: np, pageSize: this.pageSize});
  }
  startIndex(){ return (this.page-1)*this.pageSize; }
  endIndex(){ return Math.min(this.total, this.page*this.pageSize); }

  emitAction(id:string, row:T){ this.action.emit({ id, row }); }

  // displayCell(row: any, c: CrudColumn<any>) {
  //   if (c.format) return c.format(row);
  //   return this.readByKey(row, c.key);
  // }

  // private readByKey(obj: any, key: string | number | symbol) {
  //   if (obj == null || key == null) return '';
  //   // Si alguna vez quieres soportar claves anidadas con "a.b.c":
  //   if (typeof key === 'string' && key.includes('.')) {
  //     return key.split('.').reduce((acc, k) => acc?.[k], obj) ?? '';
  //   }
  //   return (obj as any)?.[key] ?? '';
  // }
}
