import { Component, Input } from "@angular/core";
import { Category } from "./categories.types";

@Component({
    selector: 'customer-details',
    standalone: true,
    template: `
        <div class="detail">
            <div><strong>Nombre: </strong> {{ c?.name || '-' }}</div>
            <div><strong>Descripción: </strong> {{ c?.description || '-' }}</div>
        </div>
    `,
    styles: [`
        .detail{ 
            display:grid; 
            row-gap:.4rem; 
            color: var(--txt-1); 
        }
        .detail > div{ 
            padding:.25rem 0; 
            border-bottom:1px dashed rgba(255,255,255,.06); 
        }   
    `]
})
export class CategoryDetailsComponent {
    @Input() c!: Category | null;
}