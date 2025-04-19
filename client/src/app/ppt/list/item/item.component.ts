import { Component, input } from '@angular/core';
import { ppt } from '@ppt';
import { PPTItem } from '../../../../../../ppt/core';

@Component({
    selector: 'app-item',
    imports: [],
    templateUrl: './item.component.html',
    styleUrl: './item.component.scss'
})
export class ItemComponent {
    item = input.required<PPTItem>();
}
