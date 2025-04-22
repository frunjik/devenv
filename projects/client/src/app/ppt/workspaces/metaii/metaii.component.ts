import { Component } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { PPTFormModule } from '../../../ppt-form.module';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MetaII, c02, c03, i03 } from '@metaii';
import { MatToolbar } from '@angular/material/toolbar';
import { metaii_codes } from './meta-code';
import { metaii_inputs } from './meta-input';
import { MatOption, MatSelect } from '@angular/material/select';
import { first } from '@ppt';

@Component({
    selector: 'ppt-metaii',
    imports: [
        MatSelect,
        MatOption,
        MatIconModule,
        MatDividerModule,
        MatButtonModule,
        MatToolbar,
        FormsModule, MatFormFieldModule, MatInputModule, PPTFormModule],
    templateUrl: './metaii.component.html',
    styleUrl: './metaii.component.scss'
})
export class PPTMetaiiComponent {

    metaii = new MetaII();

    // model: PPTModel = {
    //     id: 'PPTMetaIIModel',
    //     name: 'MetaII',
    //     type: 'PPTMetaIIModel',
    //     title: 'MetaII',
    //     fields: [
    //         {
    //             id: 'input',
    //             type: 'string',
    //             name: 'input'
    //         },
    //         {
    //             id: 'program',
    //             type: 'string',
    //             name: 'program'
    //         },
    //         {
    //             id: 'output',
    //             type: 'string',
    //             name: 'output'
    //         }
    //     ]
    // };

    metaii_codes = metaii_codes;
    metaii_inputs = metaii_inputs;

    inputControl = new FormControl(i03);
    programControl = new FormControl(c02);
    outputControl = new FormControl();

    form = new FormGroup({
        input: this.inputControl,
        program: this.programControl,
        output: this.outputControl,
    });

    compile() {
        const i = this.inputControl.value ?? '';
        const p = this.programControl.value ?? '';

        if (p.length && i.length) {
            try {
                this.outputControl.setValue(this.metaii.compile(i, p));
            } catch(e) {
                alert(e);
            }
        }
    }

    compare() {
        const p = this.programControl.value;
        const o = this.outputControl.value;
        alert(
            (p === o) ?
            'OK' : 'NO'
        );
    }

    copy() {
        this.programControl.setValue(this.outputControl.value);
    }

    clear() {
        this.outputControl.setValue('');
    }

    inputPicked(t: any) {
        const filename = t.value;
        const input = first(this.metaii_inputs.filter(c => c.filename === filename));
        if (input) {
            this.inputControl.setValue(input.contents);
        }
    }

    codePicked(t: any) {
        const filename = t.value;
        const code = first(this.metaii_codes.filter(c => c.filename === filename));
        if (code) {
            this.programControl.setValue(code.contents);
        }
    }
}
