import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { Button } from "primeng/button";

@Component({
  selector: 'app-modal',
  imports: [NgIf, NgClass, Button],
  styleUrls: ['./modal.component.scss'],
  template: `
    <div class="backdrop" *ngIf="open" (click)="backdropClose ? close.emit() : null"></div>
    <div class="sheet" *ngIf="open" [ngClass]="size">
      <header class="sheet__header">
        <h3>{{ title }}</h3>
        <p-button 
          icon="pi pi-times" 
          [rounded]="true" 
          severity="danger"
          (click)="close.emit()"
        />
      </header>

      <section class="sheet__body">
        <ng-content></ng-content>
      </section>
      
      <footer class="sheet__footer" *ngIf="hasFooter">
        <ng-content select="[footer]"></ng-content>
      </footer>
    </div>
  `
})

export class ModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() hasFooter = false;
  @Input() backdropClose = true;
  
  @Output() close = new EventEmitter<void>();
}
