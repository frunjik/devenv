import { Component, input, output } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormGroup } from '@angular/forms';
import { PPTModel } from '@ppt';
import { PPTFormFieldComponent } from '../ppt-form-field/ppt-form-field.component';
import { PPTFormModule } from '../../../ppt-form.module';
import { MatButtonModule } from '@angular/material/button';

export interface ModelFormGroup {
    model: PPTModel;
    formGroup: FormGroup;
}

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

    modelFormGroup = input.required<ModelFormGroup>();

    onCommit = output();
    onCancel = output();

    get model(): PPTModel {
        return this.modelFormGroup().model;
    }

    get formGroup(): FormGroup {
        return this.modelFormGroup().formGroup;
    }

}
