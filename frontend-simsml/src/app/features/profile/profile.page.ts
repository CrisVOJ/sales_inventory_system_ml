import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ProfileDataComponent } from "./profile-data.component";
import { ProfilePasswordComponent } from "./profile-password.component";
import { UsersService } from "../users/users.service";
import { User } from "../users/users.types";
import { Toast } from "primeng/toast";
import { MessageService } from "primeng/api";

@Component({
    selector: 'profile-page',
    standalone: true,
    imports: [
        CommonModule,
        ProfileDataComponent,
        ProfilePasswordComponent
    ],
    template: `
        <section class="page">
            <header class="page__header">
                <h1>Perfil</h1>
            </header>

            <div class="grid">
            <div class="card">
                <h2>Actualizar Datos</h2>
                <app-profile-data 
                    [value]="user"
                    (submit)="updateData($event)"
                />
            </div>

            <div class="card">
                <h2>Actualizar Contraseña</h2>
                <app-profile-password 
                    #passwordForm
                    (submit)="updatePassword($event, passwordForm)" 
                />
            </div>
            </div>
        </section>
    `,
    styles: [`
        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
        }
        .card {
            padding: 1.5rem;
            border-radius: 10px;
            background: #345861;
            color: white;
        }
        .page{ background: transparent; }
        .page__header{ margin-bottom: .75rem; }
        h1{ 
            font-size: 2.2rem; 
            margin: 0 0 .5rem; 
            color: var(--txt-1); 
        }
        h2 { margin-bottom: 1rem; }
    `]
})
export class ProfilePage {
    user: Partial<User> | null = null;

    constructor(
        private users: UsersService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.load();
    }

    load() {
        this.users.getUserData().subscribe(u => {
            if(!u) console.error('Error al obtener datos del usuario');
            this.user = u;
        });
    }

    updateData(dto: Partial<User>) {
        if (!this.user) {
            this.messageService.add({ 
                severity: 'error',
                summary: 'Operación Fallida',
                detail: 'No se encontraron datos del usuario.'
            });
            return;
        }

        const payload = {
            ...this.user,
            ...dto
        }
        this.users.update(payload).subscribe(ok => {
            if(ok) {
                this.messageService.add({ 
                    severity: 'success',
                    summary: 'Operación Exitosa',
                    detail: 'Datos actualizados exitosamente.'
                });
            };
        });
    }

    updatePassword(dto: any, passwordForm: any) {
        this.users.updatePassword(dto).subscribe(ok => {
            if (ok) {
                this.messageService.add({ 
                    severity: 'success',
                    summary: 'Operación Exitosa',
                    detail: 'Contraseña actualizada exitosamente.'
                });
                passwordForm.resetForm();
            };
        });
    }
}