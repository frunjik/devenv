import { Component, input } from '@angular/core';
import { type EMElement } from '@shared';
import { EventViewComponent } from '../event-view/event-view.component';
import { CommandViewComponent } from '../command-view/command-view.component';
import { ProcessViewComponent } from '../process-view/process-view.component';
import { ScreenViewComponent } from '../screen-view/screen-view.component';
import { ReadmodelViewComponent } from '../readmodel-view/readmodel-view.component';

@Component({
    selector: 'em-element-view',
    imports: [
        EventViewComponent,
        ScreenViewComponent,
        CommandViewComponent,
        ProcessViewComponent,
        ReadmodelViewComponent,
    ],
    templateUrl: './element-view.component.html',
    styleUrl: './element-view.component.scss'
})
export class ElementViewComponent {
    element = input<EMElement>({
        id: '',
        name: 'Event',
        type: 'event'
    })
}
