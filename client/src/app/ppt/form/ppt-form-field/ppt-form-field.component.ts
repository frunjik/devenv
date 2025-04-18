import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/module.d-DBDMCw5I';
import { MatFormFieldModule, MatLabel } from '@angular/material/module.d-vndDeG-q';
import { PPTField } from '../../../../../../ppt/core';

@Component({
    selector: 'ppt-form-field',
    imports: [
        // ReactiveFormsModule, 
        // MatFormFieldModule, 
        MatInputModule, MatSelectModule
    ],
    providers: [
        MatLabel
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './ppt-form-field.component.html',
    styleUrl: './ppt-form-field.component.scss'
})
export class PPTFormFieldComponent {
    // field: PPTField = {
    //     id: 'a',
    //     type: 'string',
    //     name: 'a'
    // };

    field = input<PPTField>({
        id: 'a',
        type: 'string',
        name: 'a'
    });

    form = input<FormGroup>(
        new FormGroup({
            a: new FormControl('')
        })
    );
}

