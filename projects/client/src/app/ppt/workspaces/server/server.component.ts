import { Component } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { PPTFormModule } from '../../../ppt-form.module';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BackendService } from '../../../backend.service';
import { PPTResult } from '@ppt';

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

    constructor(private _bs: BackendService) {
    }

    inputControl = new FormControl(`
{
    "name": "test",
    "data": 69
}
    `);
    outputControl = new FormControl();

    form = new FormGroup({
        input: this.inputControl,
        output: this.outputControl,
    });

    runTest() {

        const v = this.inputControl.value ?? '';
        const values = JSON.parse(v);

        this._bs
            .runTest(values.name, JSON.stringify(values.data))
            .subscribe(this.setOutput);
    }

    clear() {
        this.outputControl.setValue('');
    }

    // worth it ???
    setOutput = (value: PPTResult<string>) => {
        this.outputControl.setValue(JSON.stringify(value, null, 4));
    }
}
