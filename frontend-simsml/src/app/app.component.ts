import { Component } from '@angular/core';
import { AppShellComponent } from "./core/layout/app-shell/app-shell.component";

@Component({
  selector: 'app-root',
  imports: [AppShellComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend-simsml';
}
