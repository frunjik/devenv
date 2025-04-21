import { Component } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { PPTFormModule } from '../../ppt-form.module';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MetaII, c02, c03, i03 } from '@metaii';

@Component({
    selector: 'ppt-metaii',
    imports: [
        MatIconModule,
        MatDividerModule,
        MatButtonModule,
        FormsModule, MatFormFieldModule, MatInputModule, PPTFormModule],
    templateUrl: './metaii.component.html',
    styleUrl: './metaii.component.scss'
})
export class MetaiiComponent {

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


    inputControl = new FormControl(i03);
    programControl = new FormControl(c02);
    outputControl = new FormControl();

    form = new FormGroup({
        input: this.inputControl,
        program: this.programControl,
        output: this.outputControl,
    });

    compile() {
        const form = this.form;
        const i = form.value.input ?? '';
        const p = form.value.program ?? '';

        try {
            this.outputControl.setValue(this.metaii.compile(i, p));
        } catch(e) {
            alert(e);
        }
    }

    compare() {
        const form = this.form;
        const p = (form.value.program ?? '');
        const o = (form.value.output ?? '');
        alert(
            (p === o) ?
            'OK' : 'NO'
        );
    }

    copy() {
        this.programControl.setValue((this.form.value.output ?? ''));
    }

    clear() {
        this.outputControl.setValue('');
    }
}
