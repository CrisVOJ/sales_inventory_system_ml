import { Component } from "@angular/core";
import { NgIf } from "@angular/common";
import { ConfirmService, ConfirmPayload } from "./confirm.service";

@Component({
    selector: 'app-confirm',
    standalone: true,
    imports: [NgIf],
    template: `
        <div class="backdrop" *ngIf="state" (click)="emit(false)"></div>
        <div class="dialog" *ngIf="state">
            <h3>{{ state.title }}</h3>
            <p>{{ state.message }}</p>
            <div class="row">
                <button class="btn ghost" (click)="emit(false)">{{ state.cancelText || 'No' }}</button>
                <button class="btn" (click)="emit(true)">{{ state.okText || 'Sí' }}</button>
            </div>
        </div>
    `,
    styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent {
    state: ConfirmPayload | null = null;
    constructor(private confirm: ConfirmService) {
        this.confirm.events$.subscribe(s => this.state = s);
    }
    emit(ok: boolean){
        this.state?.resolve(ok);
        this.confirm.close();
    }
}