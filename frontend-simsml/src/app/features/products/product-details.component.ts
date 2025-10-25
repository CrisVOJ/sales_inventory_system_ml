import { Component, Input } from "@angular/core";
import { Product } from "./products.types";
import { CategorySummary } from "../categories/categories.types";

@Component({
    selector: 'product-details',
    standalone: true,
    template: `
        <div class="detail">
            <div><strong>Código: </strong> {{ p?.code || '-' }}</div>
            <div><strong>Nombre: </strong> {{ p?.name || '-' }}</div>
            <div><strong>Descripción: </strong> {{ p?.description || '-' }}</div>
            <div><strong>Precio Sugerido: </strong> {{ p?.suggestedPrice || '-' }}</div>
            <div><strong>Unidad: </strong> {{ p?.unit?.name || '-' }}</div>
            <div><strong>Categorias: </strong> {{ formatCategories(p?.categories) || '-' }}</div>
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
export class ProductDetailsComponent {
    @Input() p!: Product | null;

    formatCategories(categories: CategorySummary[] | null | undefined): string {
        if (!categories) return '-';
        return categories.map(c => c.name).join(', ');
    }
}
