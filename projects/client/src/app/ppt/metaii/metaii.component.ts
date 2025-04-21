import { Component } from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormControl, FormGroup, FormsModule} from '@angular/forms';
import {PPTTextComponent} from '../text/text.component';
import { PPTModel } from '@ppt';
import { PPTFormComponent } from '../form/ppt-form/ppt-form.component';
import { PPTFormModule } from '../../ppt-form.module';

@Component({
  selector: 'ppt-metaii',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, PPTFormModule],
  templateUrl: './metaii.component.html',
  styleUrl: './metaii.component.scss'
})
export class MetaiiComponent {

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

    form = new FormGroup({
        input:      new FormControl(''),
        program:    new FormControl(''),
        output:     new FormControl(''),
    })
    
}
