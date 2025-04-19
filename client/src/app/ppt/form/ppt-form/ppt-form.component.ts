import { Component } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup } from '@angular/forms';
import { PPTField, PPTModel } from '../../../../../../ppt/core';
import { PPTFormFieldComponent } from '../ppt-form-field/ppt-form-field.component';
import { PPTFormModule } from 'src/app/ppt-form.module';
import { modelField, modelModel } from '../../../../../../ppt/models';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'ppt-form',
    templateUrl: './ppt-form.component.html',
    styleUrl: './ppt-form.component.scss',
    imports: [
        MatButtonModule,
        MatInputModule, 
        MatSelectModule,
        PPTFormModule,
        PPTFormFieldComponent,
    ],
})
export class PPTFormComponent {

    model = modelModel;

    form = this.createFormGroup(this.model);

    createFormField(field: PPTField) {
        return new FormControl(field.name)
    }

    createFormGroup(model: PPTModel) {
        const fields: any = {};
        model.fields.forEach((field) => {
            fields[field.id] = this.createFormField(field);
        });
        return new FormGroup(fields);
    }
}
