import { Component } from '@angular/core';
import { AppShellComponent } from "./core/layout/app-shell/app-shell.component";
import { AuthService } from './shared/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [AppShellComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend-simsml';

  constructor(private authService: AuthService) {
    if (!this.authService.isLoggedIn) {
      this.authService.logout();
    }
  }
}
