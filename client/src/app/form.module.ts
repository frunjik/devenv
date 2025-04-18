import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/module.d-DBDMCw5I';
import { MatFormFieldModule } from '@angular/material/module.d-vndDeG-q';

@NgModule({
    declarations: [
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule, MatSelectModule,
    ],
    providers: [],
    exports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule, MatSelectModule,
    ]
})
export class FormModule { }
