import { Component, Input } from "@angular/core";
import { NgIf } from "@angular/common";
import { User } from "./users.types";

@Component({
    selector: 'user-details',
    standalone: true,
    imports: [NgIf],
    template: `
        <div class="detail">
            <div><strong>Doc. Identidad: </strong> {{ u?.identityDoc || '-' }}</div>
            <div><strong>Nombre: </strong> {{ u?.name || '-' }}</div>
            <div><strong>Apellido Paterno: </strong> {{ u?.paternalSurname || '-' }}</div>
            <div><strong>Apellido Materno: </strong> {{ u?.maternalSurname || '-' }}</div>
            <div><strong>Telefono: </strong> {{ u?.phone || '-' }}</div>
            <div><strong>Direccion: </strong> {{ u?.address || '-' }}</div>
            <div><strong>Nombre de Usuario: </strong> {{ u?.username || '-' }}</div>
            <div><strong>Correo Electrónico: </strong> {{ u?.email || '-' }}</div>
            <div><strong>Roles: </strong> {{ u?.roles?.join(', ') || '-' }}</div>
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
export class UserDetailsComponent {
    @Input() u!: User | null;
}
