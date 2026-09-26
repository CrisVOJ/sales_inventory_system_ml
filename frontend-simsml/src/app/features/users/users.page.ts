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
import { roleListLabel } from '../../shared/roles/role-labels';
import { MessageService } from 'primeng/api';
import { FloatLabel } from 'primeng/floatlabel';
import { MultiSelectModule } from 'primeng/multiselect';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

interface RoleOption {
  name: string;
  value: string;
}

@Component({
  selector: 'users-page',
  templateUrl: './users.page.html',
  imports: [
    CommonModule,
    DataTableComponent,
    ModalComponent,
    UserFormComponent,
    UserDetailsComponent,
    ConfirmComponent,
    FloatLabel,
    MultiSelectModule,
    ReactiveFormsModule
  ]
})
export class UsersPage {
  private fb = new FormBuilder();
  private formSubscription?: any;

  cols: CrudColumn<User>[] = [
    { key:'identityDoc', header:'Doc. Identidad',     width:'160px' },
    { key:'username',    header:'Nombre Usuario',  width:'220px' },
    { key:'roles',        header:'Rol',                width:'150px', 
      format: (u) => roleListLabel(u.roles)
    },
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
  additionalParams: Record<string, any> = {};

  roleOptions: RoleOption[] = [];

  constructor(
    private users: UsersService,
    private confirm: ConfirmService,
    private messageService: MessageService
  ){
    this.load();
  }

  filtersForm: FormGroup = this.fb.group({
    roles: [null],
  })

  ngOnInit() {
    this.roleOptions = [
      {name: 'ADMIN', value: 'Administrador'},
      {name: 'SELLER', value: 'Vendedor'},
    ]

    this.formSubscription = this.filtersForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    ).subscribe(val => {
      this.applyFilters(val);
    });
  }

  private applyFilters(formValues: any) {
    this.additionalParams = {};

    if (formValues.roles && formValues.roles.length > 0) {
      this.additionalParams['role'] = formValues.roles;
    }

    this.page = 1;
    this.load();
  }

  load(){ 
    this.users.list({ 
      q: this.q, 
      page: this.page, 
      pageSize: this.pageSize,
      additionalParams: this.additionalParams
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
    this.selected = {...row, roles: row.roles ?? [] };
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
      ? this.users.update({ ...payload, userId: this.editing.userId })
      : this.users.create(payload);
    
    req$.subscribe({
      next: ok => {
        if(!ok) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No autorizado o datos invalidos'
          })

          return;
        }
        if(this.editing?.userId){
          this.messageService.add({
            severity: 'success',
            summary: 'Operación Exitosa',
            detail: 'Usuario actualizado exitosamente'
          });
        } else {
          this.messageService.add({
            severity: 'success',
            summary: 'Operación Exitosa',
            detail: 'Usuario creado exitosamente'
          });
        }
        this.closeForm();
        this.load();
      },
      error: e => {
        if (e.status === 403) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: '403: sin permisos suficientes'
          })
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error inesperado'
          })
        };
      }
    })
  }

  remove(id: number){
    this.users.remove(id, 'userId').subscribe(ok => {
      if(!ok) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No autorizado o datos invalidos'
        });

        return;
      };
      this.messageService.add({
        severity: 'success',
        summary: 'Operación Exitosa',
        detail: 'Usuario eliminado exitosamente'
      })
      this.load();
    })
  }
}
