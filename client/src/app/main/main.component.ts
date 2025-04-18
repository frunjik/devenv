import { Component } from '@angular/core';
import { PPTFormComponent } from '../ppt/form/ppt-form/ppt-form.component';

@Component({
    selector: 'app-main',
    imports: [
        PPTFormComponent
    ],
    templateUrl: './main.component.html',
    styleUrl: './main.component.scss'
})
export class MainComponent {

}
