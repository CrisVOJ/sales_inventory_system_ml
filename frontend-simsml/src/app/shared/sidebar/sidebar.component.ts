import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { PanelMenuModule } from 'primeng/panelmenu';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  imports: [
    CommonModule,
    PanelMenuModule,
    ButtonModule
  ]
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() toggle = new EventEmitter<void>();

  private _menu = signal<MenuItem[]>([
    { label: 'Inicio',       icon: 'pi pi-home',          routerLink: ['/'],            routerLinkActiveOptions: { exact: true } },
    { label: 'Ventas',       icon: 'pi pi-shopping-cart', routerLink: ['/sales'],       routerLinkActiveOptions: { exact: true } },
    { label: 'Ubicaciones',  icon: 'pi pi-map-marker',    routerLink: ['/locations'],   routerLinkActiveOptions: { exact: true } },
    { label: 'Productos',    icon: 'pi pi-inbox',         routerLink: ['/products'],    routerLinkActiveOptions: { exact: true } },
    { label: 'Categorias',   icon: 'pi pi-table',         routerLink: ['/categories'],  routerLinkActiveOptions: { exact: true } },
    { label: 'Clientes',     icon: 'pi pi-users',         routerLink: ['/customers'],   routerLinkActiveOptions: { exact: true } },
    { label: 'Predicciones', icon: 'pi pi-lightbulb',     routerLink: ['/predictions'], routerLinkActiveOptions: { exact: true } },
    { label: 'Usuarios',     icon: 'pi pi-user',          routerLink: ['/users'],       routerLinkActiveOptions: { exact: true } }
  ]);

  menuItems = computed(() => this._menu());
}
