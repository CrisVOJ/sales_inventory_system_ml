import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../../shared/header/header.component';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { AuthService } from '../../../shared/auth/auth.service';

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

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  goToProfile(){
    this.router.navigateByUrl('/profile');
  }

  logout(){
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
