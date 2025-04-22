import { Component, signal } from '@angular/core';
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
import { metaii_pairs } from './meta-pairs';


interface InputAndCodePair {
    id: string;
    name: string;
}

interface NameAndContents {
    filename: string,
    contents: string
};

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

    rows = 50;

    metaii_inputs: NameAndContents[]    = metaii_inputs;
    metaii_programs: NameAndContents[]  = metaii_codes;
    metaii_pairs: InputAndCodePair[]    = metaii_pairs;

    // selectedPairIndex = -1;
    selectedInputIndex = signal(-1);
    selectedProgramIndex = signal(-1);

    inputControl = new FormControl(i03);
    programControl = new FormControl(c02);
    outputControl = new FormControl();

    form = new FormGroup({
        input: this.inputControl,
        program: this.programControl,
        output: this.outputControl,
    });

    get selectedInput(): NameAndContents {
        return this.metaii_inputs[this.selectedInputIndex()];
    }

    get selectedProgram(): NameAndContents {
        return this.metaii_programs[this.selectedProgramIndex()];
    }

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
        const p = this.programControl.value?.trim();
        const o = this.outputControl.value?.trim();
        alert(
            // TODO: not foolproof - need to make newlines uniform ...
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

    inputChanged(t: any) {
        const filename = t.value;
        const index = this.metaii_inputs.findIndex((i) => i.filename === filename);
        this.selectedInputIndex.set(index);
        const text = this.selectedInput.contents;
        if (text) {
            this.inputControl.setValue(text);
        }
    }

    programChanged(t: any) {
        const filename = t.value;
        const index = this.metaii_programs.findIndex((i) => i.filename === filename);
        this.selectedProgramIndex.set(index);
        const text = this.selectedProgram.contents;
        if (text) {
            this.programControl.setValue(text);
        }
    }
    
    pairChanged(t: any) {

        const inputAndProgramIndex: string = t.value;
        const [input, program] = (inputAndProgramIndex ?? ',').split(',').map(Number);

        if (input === -1 || program === -1) {
            throw new Error(`pairPicked: not a valid pair '${inputAndProgramIndex}' => (${input}, ${program})`);
        }

        // TODO: how do we set the selected item of the other combos (and not just the text ???)
        this.selectedInputIndex.set(input);
        this.selectedProgramIndex.set(program);

        console.log(this.selectedInput, this.selectedProgram)

        this.form.setValue({
            input: this.selectedInput.contents,
            program: this.selectedProgram.contents,
            output: '',
        });
    }
}
