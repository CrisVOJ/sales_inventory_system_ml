import { Component, Input } from "@angular/core";
import { Location } from "./locations.types";

@Component({
    selector: 'location-details',
    standalone: true,
    template: `
        <div class="detail">
            <div><strong>Código: </strong> {{ l?.code || '-' }}</div>
            <div><strong>Nombre: </strong> {{ l?.name || '-' }}</div>
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
export class LocationDetailsComponent {
    @Input() l!: Location | null;
}