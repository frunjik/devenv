import { Component, input, output } from '@angular/core';
import {FormGroup, FormsModule} from '@angular/forms';
import { PPTField } from '@ppt';
import { PPTFormModule } from '../../ppt-form.module';

@Component({
    selector: 'ppt-text',
    imports: [
        PPTFormModule,
    ],
    templateUrl: './text.component.html',
    styleUrl: './text.component.scss'
})
export class PPTTextComponent {
    form = input.required<FormGroup>();
    field = input.required<PPTField>();
}
