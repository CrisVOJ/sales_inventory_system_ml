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
import { PopoverModule } from 'primeng/popover';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';

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
  styleUrls: ['./data-table.component.scss'],
  templateUrl: './data-table.component.html',
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
    NgIf,
    PopoverModule,
    PaginatorModule,
    SelectModule
  ]
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
  @Input() showCreate = true;
  @Input() showSearch = true;
  @Input() showFilter = false;
  
  @Output() create = new EventEmitter<void>();
  @Output() onSearch = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<{page:number,pageSize:number}>();
  @Output() action = new EventEmitter<{id:string,row:T}>();

  query = '';

  options = [
    { label: '5', value: 5 },
    { label: '10', value: 10 },
    { label: '15', value: 15 }
  ]

  pageCount() { 
    return Math.max(1, Math.ceil(this.total / this.pageSize)); 
  }
  
  pages() { 
    return Array.from({length: this.pageCount()}, (_,i)=>i+1).slice(0, 6); 
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.pageChange.emit({page: this.page, pageSize: this.pageSize});
  }
  
  pageSizeChange(p:number){
    const np = Math.min(Math.max(1,p), this.pageCount());
    this.page = np;
    this.pageChange.emit({page: np, pageSize: this.pageSize});
  }
  
  startIndex() { 
    return (this.page-1)*this.pageSize; 
  }
  
  endIndex() { 
    return Math.min(this.total, this.page*this.pageSize); 
  }

  emitAction(id:string, row:T) { 
    this.action.emit({ id, row }); 
  }
}
