import { Component, input } from '@angular/core';
import { PPTList } from '@ppt';
import { PPTItemComponent } from '../item/item.component';

@Component({
    selector: 'ppt-list',
    imports: [PPTItemComponent],
    templateUrl: './list.component.html',
    styleUrl: './list.component.scss'
})
export class PPTListComponent {
    list = input.required<PPTList>();
}
