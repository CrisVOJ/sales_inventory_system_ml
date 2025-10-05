// src/app/features/users/users.page.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent, CrudColumn, CrudAction } from '../../shared/data-table/data-table.component';
// import { ModalComponent } from '../../shared/ui/modal/modal.component';
// import { ConfirmComponent } from '../../shared/ui/confirm/confirm.component';
// import { ConfirmService } from '../../shared/ui/confirm/confirm.service';
import { UsersService } from './users.service';
import { User } from './users.types';
// import { UserFormComponent } from './user-form.component';
// import { UserDetailsComponent } from './user-details.component';

@Component({
  selector: 'users-page',
  imports: [CommonModule, DataTableComponent],
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

      <!-- Modal Crear/Editar
      <ui-modal [open]="formOpen" [title]="formTitle" [hasFooter]="false" (close)="closeForm()">
      <user-form [value]="editing" (cancel)="closeForm()" (submit)="save($event)"></user-form>
      </ui-modal>

        Modal Detalle
      <ui-modal [open]="detailOpen" title="Detalle Usuario" (close)="detailOpen=false">
      <user-details [u]="selected"></user-details>
      </ui-modal>

      Confirm global
      <ui-confirm></ui-confirm> -->
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
    { key:'role',        header:'Rol',                width:'150px' },
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
    private api: UsersService 
    //private confirm: ConfirmService
  ){
    this.load();
  }

  formOpen = false;
  formTitle = 'Agregar Usuario';
  editing: Partial<User> | null = null;

  detailOpen = false;
  selected: User | null = null;

  load(){ this.api.list({ q: this.q, page: this.page, pageSize: this.pageSize }).subscribe(r => { this.rows = r.rows; this.total = r.total; }); }
  search(s: string){ this.q = s; this.page = 1; this.load(); }
  paginate(p: {page:number, pageSize:number}){ this.page = p.page; this.pageSize = p.pageSize; this.load(); }

  openCreate() {
    alert('Modal para crear usuario')
  }

  onRowAction(ev:{id:string,row:User}) {
    switch(ev.id) {
      case 'view':    return alert(`Detalle de ${ev.row.username}`);
      case 'edit':    return alert(`Editar ${ev.row.username}`);
    }
  }

//   openCreate(){ this.formTitle = 'Agregar Usuario'; this.editing = null; this.formOpen = true; }
//   openEdit(row: User){ this.formTitle = 'Editar Usuario'; this.editing = row; this.formOpen = true; }
//   closeForm(){ this.formOpen = false; this.editing = null; }

//   save(payload: Partial<User>){
//     const action = this.editing?.id
//       ? this.api.update(this.editing.id, payload)
//       : this.api.create(payload as User);
//     action.subscribe(() => { this.closeForm(); this.load(); });
//   }

//   openDetails(row: User){ this.selected = row; this.detailOpen = true; }

//   async confirmDelete(row: User){
//     const ok = await this.confirm.ask('Eliminar Usuario', `¿Está seguro de eliminar al usuario: ${row.username}?`);
//     if(ok){ this.api.remove(row.id).subscribe(()=> this.load()); }
//   }
}
