import { Component, signal, WritableSignal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';

import { ppt } from '../../../ppt';
import { PPTField } from '../../../ppt/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [
        MatToolbar,
        MatButtonModule,
        RouterOutlet,
    ]
})
export class AppComponent {
    title = 'Devenv';

    model = ppt.models.modelField;

    field: PPTField = {
        id: 'test',
        type: 'test',
        name: 'test'
    }

    count: WritableSignal<number> = signal(0);

    create() {
    }
}
