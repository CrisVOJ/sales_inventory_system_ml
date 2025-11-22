import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from "@angular/core";
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputTextModule } from "primeng/inputtext";
import { User } from "../users/users.types";

@Component({
    selector: 'app-profile-data',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputTextModule,
        FloatLabelModule
    ],
    template: `
        <form [formGroup]="form" class="form-grid">

            <p-floatlabel variant="on">
                <input pInputText id="identityDoc" formControlName="identityDoc" autocomplete="off"/>
                <label for="identityDoc">Doc. Identidad</label>
            </p-floatlabel>

            <p-floatlabel variant="on">
                <input pInputText id="phone" formControlName="phone" autocomplete="off"/>
                <label for="phone">Teléfono</label>
            </p-floatlabel>

            <p-floatlabel variant="on">
                <input pInputText id="address" formControlName="address" autocomplete="off"/>
                <label for="address">Dirección</label>
            </p-floatlabel>

            <p-floatlabel variant="on">
                <input pInputText id="name" formControlName="name" autocomplete="off"/>
                <label for="name">Nombre</label>
            </p-floatlabel>

            <p-floatlabel variant="on">
                <input pInputText id="paternalSurname" formControlName="paternalSurname" autocomplete="off"/>
                <label for="paternalSurname">Apellido Paterno</label>
            </p-floatlabel>

            <p-floatlabel variant="on">
                <input pInputText id="maternalSurname" formControlName="maternalSurname" autocomplete="off"/>
                <label for="maternalSurname">Apellido Materno</label>
            </p-floatlabel>

            <p-floatlabel variant="on">
                <input pInputText id="email" formControlName="email" autocomplete="off"/>
                <label for="email">Email</label>
            </p-floatlabel>
        </form>

        <div class="actions">
            <button class="btn" (click)="save()" [disabled]="form.invalid">Actualizar</button>
        </div>
    `,
    styles: [`
        .form-grid {
            display: grid;
            gap: 1rem;
            grid-template-columns: repeat(3, 1fr);
        }
        input {
            background: #EBFEFF;
            color: #000;
            padding: .55rem .7rem;
            border-radius: .4rem;
            width: 100%;
            box-sizing: border-box;
            min-height: 42px;
        }
        label { display: flex; }
        .actions { margin-top: 1rem; text-align: right; }
        .btn {
            background:#00BFFF;
            color:white;
            padding:.6rem 1.2rem;
            border-radius:.5rem;
            border:0;
            cursor:pointer;
        }
    `]
})
export class ProfileDataComponent implements OnChanges {
    @Input() value: Partial<User> | null = null;
    @Output() submit = new EventEmitter<any>();

    form!: FormGroup;

    constructor(private fb: NonNullableFormBuilder) {}

    ngOnInit() {
        this.form = this.fb.group({
            identityDoc: this.fb.control('', Validators.required),
            phone: this.fb.control(''),
            address: this.fb.control(''),
            name: this.fb.control('', Validators.required),
            paternalSurname: this.fb.control('', Validators.required),
            maternalSurname: this.fb.control(''),
            email: this.fb.control('', [Validators.required, Validators.email]),
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['value'] && this.value && this.form) {
            this.form.patchValue({
                ...this.value,
                identityDoc: this.value.identityDoc ?? '',
                phone: this.value.phone ?? '',
                address: this.value.address ?? '',
                name: this.value.name ?? '',
                paternalSurname: this.value.paternalSurname ?? '',
                maternalSurname: this.value.maternalSurname ?? '',
                email: this.value.email ?? '',
            });
        }
    }

    save() {
        console.log(this.form.value);
        this.submit.emit(this.form.value);
    }
}
