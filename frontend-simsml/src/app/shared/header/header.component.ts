import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { SpeedDialModule } from 'primeng/speeddial';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  imports: [
    CommonModule,
    ToolbarModule,
    ButtonModule,
    BadgeModule,
    SpeedDialModule,
    MenuModule
  ]
})
export class HeaderComponent {
  @Input() userName?: string;
  @Input() notifCount = 0;

  @Output() menuClick = new EventEmitter<void>();
  @Output() profileClick = new EventEmitter<void>();
  @Output() logoutClick = new EventEmitter<void>();

  profileItems: MenuItem[] = [];

  ngOnInit() {
    this.profileItems = [
      {
        label: 'Perfil',
        icon: 'pi pi-user',
        command: () => this.onPerfil()
      },
      {
        label: 'Cerrar Sesión',
        icon: 'pi pi-sign-out',
        command: () => this.onLogout()
      }
    ]
  }

  onPerfil() {
    this.profileClick.emit();
  }

  onLogout() {
    this.logoutClick.emit();
  }
}
