import { Component, Input } from "@angular/core";
import { Customer } from "./customers.types";

@Component({
    selector: 'customer-details',
    standalone: true,
    template: `
        <div class="detail">
            <div><strong>Doc. Identidad: </strong> {{ c?.identityDocument || '-' }}</div>
            <div><strong>Nombre: </strong> {{ c?.name || '-' }}</div>
            <div><strong>Apellido Paterno: </strong> {{ c?.paternalSurname || '-' }}</div>
            <div><strong>Apellido Materno: </strong> {{ c?.maternalSurname || '-' }}</div>
            <div><strong>Telefono: </strong> {{ c?.phone || '-' }}</div>
            <div><strong>Direccion: </strong> {{ c?.address || '-' }}</div>
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
export class CustomerDetailsComponent {
    @Input() c!: Customer | null;
}