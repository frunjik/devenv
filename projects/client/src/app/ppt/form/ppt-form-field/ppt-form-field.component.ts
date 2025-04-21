import { Component, input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';
import { PPTField } from '@ppt';
import { PPTFormModule } from '../../../ppt-form.module';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
    selector: 'ppt-form-field',
    imports: [
        PPTFormModule,
        MatInputModule, 
    ],
    templateUrl: './ppt-form-field.component.html',
    styleUrl: './ppt-form-field.component.scss'
})
export class PPTFormFieldComponent {
    form = input.required<FormGroup>();
    field = input.required<PPTField>();
}

