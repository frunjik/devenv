import { Component, input } from '@angular/core';
import { ValueViewComponent } from '../value-view/value-view.component';

@Component({
    selector: 'app-list-view',
    imports: [
        ValueViewComponent
    ],
    templateUrl: './list-view.component.html',
    styleUrl: './list-view.component.scss'
})
export class ListViewComponent {
    list = input<Array<any>>([1, 2])
}
