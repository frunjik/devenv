import { Component } from '@angular/core';
import { ppt } from '@ppt';

@Component({
    selector: 'app-models',
    standalone: true,
    templateUrl: './models.component.html',
    styleUrl: './models.component.scss',
})
export class ModelsComponent {
    readonly modelText = JSON.stringify(ppt.models, null, 2);
}
