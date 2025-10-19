// src/app/features/users/users.page.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent, CrudColumn, CrudAction } from '../../shared/data-table/data-table.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { UsersService } from './users.service';
import { User } from './users.types';
import { UserFormComponent } from "./user-form.component";
import { UserDetailsComponent } from "./user-details.component";
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { ConfirmService } from '../../shared/confirm/confirm.service';

@Component({
  selector: 'users-page',
  imports: [
    CommonModule,
    DataTableComponent,
    ModalComponent,
    UserFormComponent,
    UserDetailsComponent,
    ConfirmComponent
],
  template: `
    <section class="page">
      <header class="page__header">
      <h1>Usuarios</h1>
      </header>

      <app-data-table
        [entityName]="'Usuario'"
        [columns]="cols"
        [rows]="rows"
        [total]="total"
        [page]="page"
        [pageSize]="pageSize"
        [actions]="rowActions"
        [searchPlaceholder]="'Buscar ...'"
        (create)="openCreate()"
        (onSearch)="search($event)"
        (pageChange)="paginate($event)"
        (action)="onRowAction($event)"
      />

      <!-- Modal Crear/Editar -->
      <app-modal 
        [open]="formOpen" 
        [title]="formTitle" 
        [hasFooter]="false" 
        (close)="closeForm()"
      >
        <user-form 
          *ngIf="formOpen"
          [value]="editing" 
          (cancel)="closeForm()" 
          (submit)="onSubmitForm($event)"
        />
      </app-modal>

      <app-modal 
        [open]="detailOpen"
        [title]="formTitle"
        [hasFooter]="false"
        (close)="detailOpen=false"
      >
        <user-details [u]="selected"/>
      </app-modal>

      <app-confirm/>
    </section>
  `,
  styles:[`
    .page__header{ margin-bottom: .75rem; }
    h1{ font-size: 2.2rem; margin: 0 0 .5rem; color: var(--txt-1); }
    .page{ background: transparent; }
    `
  ]
})
export class UsersPage {
  cols: CrudColumn<User>[] = [
    { key:'identityDoc', header:'Doc. Identidad',     width:'160px' },
    { key:'username',    header:'Nombre Usuario',  width:'220px' },
    { key:'roles',        header:'Rol',                width:'150px' },
    { key:'name',        header:'Nombre',
      format: (u) => [u.name, u.paternalSurname, u.maternalSurname].filter(Boolean).join(' ')
     },
    { key:'email',       header:'Correo',             width:'260px' },
  ];

  rowActions: CrudAction<User>[] = [
    { 
      id:'view', label:'Detalles', icon:'pi pi-eye',
      color: u => '#00B4E0' 
    },
    { 
      id:'edit',  label:'Editar', icon:'pi-pen-to-square', 
      color: u => '#86E000'
    },
    {
      id:'delete', label:'Eliminar', icon:'pi-trash',
      color: u => '#E04500'
    }
    // { id:'reset',  label:'Reset',   icon:'🔑',  class:'warn',
    //   show: u => u.role === 'Administrador',
    //   tooltip: u => `Resetear contraseña de ${u.username}` },
    // { id:'delete', label:'Eliminar',icon:'🗑️',  class:'danger',
    //   disabled: u => u.role === 'Administrador' } // ej: no borrar admins
  ];

  rows: User[] = [];
  total = 0;
  page = 1; pageSize = 5;
  q = '';

  constructor(
    private users: UsersService,
    private confirm: ConfirmService
  ){
    this.load();
  }

  load(){ 
    this.users.list({ 
      q: this.q, 
      page: this.page, 
      pageSize: this.pageSize 
    }).subscribe(r => { 
      this.rows = r.rows; 
      this.total = r.total; 
    }); 
  }
  
  search(s: string){ 
    this.q = s; 
    this.page = 1; 
    this.load(); 
  }

  paginate(p: {page:number, pageSize:number}){ 
    this.page = p.page;
    this.pageSize = p.pageSize;
    this.load();
  }

  formOpen = false;
  formTitle = 'Agregar Usuario';
  editing: Partial<User> | null = null;

  detailOpen = false;
  selected: User | null = null;

  openCreate() {
    this.formTitle = 'Agregar Usuario';
    this.editing = null;
    this.formOpen = true;
  }

  openEdit(row: User) {
    this.formTitle = 'Actualizar Usuario';
    this.editing = row;
    this.formOpen = true;
  }

  openDetail(row: User) {
    this.formTitle = 'Detalles de Usuario';
    this.selected = row;
    this.detailOpen = true;
  }

  async confirmDelete(row: User) {
    const ok = await this.confirm.ask('Eliminar Usuario', `¿Está seguro de eliminar al Usuario: ${row.username}?`);
    if (ok) {
      this.remove(row.userId);
    }
  }

  closeForm(){ 
    this.formOpen = false; 
    this.editing = null; 
  }

  onRowAction(ev:{id:string,row:User}) {
    switch(ev.id) {
      case 'view':    return this.openDetail(ev.row);
      case 'edit':    return this.openEdit(ev.row);
      case 'delete':  return this.confirmDelete(ev.row);
    }
  }

  onSubmitForm(payload: Partial<User>) {
    const req$ = this.editing?.userId
      ? this.users.update(this.editing.userId, payload)
      : this.users.create(payload);
    
    req$.subscribe({
      next: ok => {
        if(ok) {
          this.closeForm();
          this.load();
        } else {
          alert('No autorizado o datos invalidos');
        }
      },
      error: e => {
        if (e.status === 403) alert('403: sin permisos suficientes');
        else alert('Error inesperado');
      }
    })
  }

  create(payload: Partial<User>){
    this.users.create(payload).subscribe(ok => {
      if(ok) this.load();
    })
  }

  update(id: number, patch: Partial<User>){
    this.users.update(id, patch).subscribe(ok => {
      if(ok) this.load();
    })
  }

  remove(id: number){
    this.users.remove(id).subscribe(ok => {
      if(ok) this.load();
    })
  }


//   openDetails(row: User){ this.selected = row; this.detailOpen = true; }

//   async confirmDelete(row: User){
//     const ok = await this.confirm.ask('Eliminar Usuario', `¿Está seguro de eliminar al usuario: ${row.username}?`);
//     if(ok){ this.api.remove(row.id).subscribe(()=> this.load()); }
//   }
}
