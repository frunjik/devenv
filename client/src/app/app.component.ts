import { Component, signal, WritableSignal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';

import { ppt, PPTItem, PPTList } from '@ppt';
import { PPTItemComponent } from './ppt/list/item/item.component';
import { PPTListComponent } from './ppt/list/list/list.component';
import { PPTListEditorComponent } from "./ppt/list/list-editor/list-editor.component";
import { PPTBoxComponent } from "./ppt/box/box.component";
import { CommonModule, NgStyle } from '@angular/common';
import { MainComponent } from "./main/main.component";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [
        CommonModule,
        MatToolbar,
        MatButtonModule,
        RouterOutlet
        // PPTBoxComponent
    ],
})
export class AppComponent {
}
