import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../../shared/header/header.component';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-shell',
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent
  ]
})
export class AppShellComponent {
  private _sidebarCollapsed = signal(true);
  sidebarCollapsed = this._sidebarCollapsed.asReadonly();
  toggleSidebar(){ this._sidebarCollapsed.update(v => !v); }
}
