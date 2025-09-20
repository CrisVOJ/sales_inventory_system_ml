import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  imports: [
    CommonModule,
    ToolbarModule,
    ButtonModule,
    BadgeModule
  ]
})
export class HeaderComponent {
  @Input() userName?: string;
  @Input() notifCount = 0;

  @Output() menuClick = new EventEmitter<void>();
  @Output() profileClick = new EventEmitter<void>();
}
