import { Component, input } from '@angular/core';
import { PPTItem } from '@ppt';

@Component({
    selector: 'ppt-item',
    imports: [],
    templateUrl: './item.component.html',
    styleUrl: './item.component.scss'
})
export class PPTItemComponent {
    item = input.required<PPTItem>();
}
