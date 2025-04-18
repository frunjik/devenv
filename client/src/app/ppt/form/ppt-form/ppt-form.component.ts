import { Component } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup } from '@angular/forms';
import { PPTField, PPTModel } from '../../../../../../ppt/core';
import { PPTFormFieldComponent } from '../ppt-form-field/ppt-form-field.component';
import { PPTFormModule } from 'src/app/ppt-form.module';
import { modelField, modelModel } from '../../../../../../ppt/models';

@Component({
    selector: 'ppt-form',
    templateUrl: './ppt-form.component.html',
    styleUrl: './ppt-form.component.scss',
    imports: [
        MatInputModule, 
        MatSelectModule,
        PPTFormModule,
        PPTFormFieldComponent,
    ],
})
export class PPTFormComponent {

    formFields: PPTField[] = [
        {
            id: 'a',
            type: 'string',
            name: 'a'
        },
        {
            id: 'b',
            type: 'string',
            name: 'b'
        },
        {
            id: 'c',
            type: 'string',
            name: 'c'
        },
        {
            id: 'v',
            type: 'string',
            name: 'test',
        },
        // {
        //     id: 'a',
        //     type: 'string',
        //     name: 'Name',
        // }        
        // ,
        ...(modelModel.fields as PPTField[])
    ];

    formDefinition: PPTModel = {
        id: '',
        name: 'test',
        // fields: this.formFields
        fields: modelModel.fields
    };    

    // formDefinition2: PPTModel = modelModel;    


    model = this.formDefinition;

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
