import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule, MatLabel } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
// import { MatLabel } from '@angular/material/';
import { PPTField } from '../../../../../../ppt/core';
import { PPTFormModule } from 'src/app/ppt-form.module';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
    selector: 'ppt-form-field',
    imports: [
        // ReactiveFormsModule, 
        MatInputModule, MatSelectModule,
        PPTFormModule,
        MatFormFieldModule, 
        // MatLabel,
        // MatFormFieldModule
    ],
    // providers: [
    //     MatLabel
    // ],
    standalone: true,
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

