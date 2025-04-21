import { Component } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { PPTFormModule } from '../../../ppt-form.module';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import rubico from 'rubico';
import { safeStringify } from '@ppt';

function evalInScope(js: string, contextAsScope: Object) {
    return new Function(`with (this) { return (${js}); }`).call(contextAsScope);
}


const rubicoText = `pipe([1, 2, 3, 4, 5, 6, 7, 8, 9], [
    filter(n => n % 2 == 1),
    map(n => n * n),
    ])`;


const safeStringifyExample = `safeStringify(window, 4)`;

@Component({
    selector: 'ppt-js',
    imports: [
        MatIconModule,
        MatDividerModule,
        MatButtonModule,
        MatToolbarModule,
        FormsModule, MatFormFieldModule, MatInputModule, PPTFormModule],
    templateUrl: './js.component.html',
    styleUrl: './js.component.scss'
})
export class PPTJSComponent {


    inputControl = new FormControl(safeStringifyExample);
    outputControl = new FormControl();

    form = new FormGroup({
        input: this.inputControl,
        output: this.outputControl,
    });

    compile() {
        const form = this.form;
        const i = form.value.input ?? '';

        let result;

        try {
            result = evalInScope(i, {pipe: rubico.pipe, map: rubico.map, filter: rubico.filter, safeStringify});
        } catch(e) {
            result = e;
        }

        this.outputControl.setValue(result);
    }

    clear() {
        this.outputControl.setValue('');
    }
}
