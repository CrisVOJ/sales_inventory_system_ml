import { Component, Input } from "@angular/core";
import { Inventory } from "./inventories.types";

@Component({
    selector: 'inventory-details',
    standalone: true,
    template: `
        <div class="detail">
            <div><strong>Stock Actual: </strong> {{ i?.currentStock || '-' }}</div>
            <div><strong>Stock Minímo: </strong> {{ i?.minimumStock || '-' }}</div>
            <div><strong>Producto: </strong> {{ i?.product?.name }}</div>
            <div><strong>Ubicación: </strong> {{ i?.location?.name || '-' }}</div>
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
export class InventoryDetailsComponent {
    @Input() i!: Inventory | null;
}