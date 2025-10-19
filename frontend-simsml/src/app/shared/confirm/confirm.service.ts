import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

export interface ConfirmPayload {
    title: string;
    message: string;
    okText?: string;
    cancelText?: string;
    resolve: (ok: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
    private _events = new Subject<ConfirmPayload | null>();
    events$ = this._events.asObservable();

    ask(title: string, message: string, okText='Sí', cancelText='No'): Promise<boolean> {
        return new Promise(resolve => {
            this._events.next({ title, message, okText, cancelText, resolve });
        });
    }

    close() {
        this._events.next(null);
    }
}