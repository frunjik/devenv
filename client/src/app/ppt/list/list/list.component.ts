import { Component, input } from '@angular/core';
import { PPTList } from '@ppt';

@Component({
    selector: 'ppt-list',
    imports: [],
    templateUrl: './list.component.html',
    styleUrl: './list.component.scss'
})
export class PPTListComponent {
    list = input.required<PPTList>();
}
