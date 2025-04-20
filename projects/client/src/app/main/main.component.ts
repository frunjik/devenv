import { Component } from '@angular/core';
import { PPTFormComponent } from '../ppt/form/ppt-form/ppt-form.component';
import { PPTFormModule } from '../ppt-form.module';

@Component({
    selector: 'app-main',
    imports: [
        PPTFormComponent
        // PPTFormModule
    ],
    templateUrl: './main.component.html',
    styleUrl: './main.component.scss'
})
export class MainComponent {

}
