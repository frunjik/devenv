import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { PPTFormComponent } from './ppt/form/ppt-form/ppt-form.component';
import { PPTFormFieldComponent } from './ppt/form/ppt-form-field/ppt-form-field.component';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';

// Not used - see /main.ts
@NgModule({
    declarations: [
        // PPTFormComponent,
        // PPTFormFieldComponent
        // MatLabel,
        // MatFormField,
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule, 
        // PPTFormComponent,
        // PPTFormFieldComponent
        // CdkDropList,
        // CdkDrag,
    ],
    providers: [

        // MatLabel,
        // MatFormField,
        

        // PPTFormComponent,
        // PPTFormFieldComponent

    ],
    exports: [
        CommonModule,
        ReactiveFormsModule,
        // MatFormFieldModule, 
        // MatLabel,
        // MatFormField,
        // PPTFormComponent,
        // PPTFormFieldComponent
    ]
})
export class PPTFormModule { }
