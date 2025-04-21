import { Component } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { PPTFormModule } from '../../../ppt-form.module';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import pipe from 'rubico/pipe';

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

    inputControl = new FormControl('[1, 2, 3].map(n => n * n)');
    outputControl = new FormControl();

    form = new FormGroup({
        input: this.inputControl,
        output: this.outputControl,
    });

    compile() {
        const form = this.form;
        const i = form.value.input ?? '';

        try {
            this.outputControl.setValue(eval(i));
        } catch(e) {
            alert(e);
        }
    }

    clear() {
        this.outputControl.setValue('');
    }
}
