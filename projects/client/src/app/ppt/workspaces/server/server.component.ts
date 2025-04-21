import { Component } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { PPTFormModule } from '../../../ppt-form.module';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

function separator(): string {
    return `\n----------------------------------------------------------------------------------------${new Date().toISOString()}\n`;
}

@Component({
    selector: 'ppt-js',
    imports: [
        MatIconModule,
        MatDividerModule,
        MatButtonModule,
        MatToolbarModule,
        FormsModule, MatFormFieldModule, MatInputModule, PPTFormModule],
    templateUrl: './server.component.html',
    styleUrl: './server.component.scss'
})
export class PPTServerComponent {

    inputControl = new FormControl();
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

            result = 'ServerResponse: \n' + i;

        } catch (e) {
            result = e;
        }

        this.outputControl.setValue(
            
            result + 
            separator() +             
            this.outputControl.value
        );
    }

    clear() {
        this.outputControl.setValue('');
    }
}
