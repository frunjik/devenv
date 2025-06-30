import { Component, input } from '@angular/core';

@Component({
    selector: 'ppt-box',
    imports: [],
    providers: [
    ],
    templateUrl: './box.component.html',
    styleUrl: './box.component.scss'
})
export class PPTBoxComponent {
    color = input<string>('lightgray');
}
