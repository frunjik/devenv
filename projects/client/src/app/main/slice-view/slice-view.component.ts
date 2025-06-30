import { Component, input, model, signal } from '@angular/core';
import { EMSlice } from '@shared';
import { CommandViewComponent } from '../command-view/command-view.component';
import { EventViewComponent } from '../event-view/event-view.component';
import { ProcessViewComponent } from '../process-view/process-view.component';
import { ReadmodelViewComponent } from '../readmodel-view/readmodel-view.component';
import { ScreenViewComponent } from '../screen-view/screen-view.component';
import { ElementViewComponent } from '../element-view/element-view.component';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
    selector: 'em-slice-view',
    imports: [
        CommonModule,
        // AsyncPipe,
        // CdkDropList, CdkDrag,
        MatTabsModule,

        ElementViewComponent,
        // EventViewComponent,
        // ReadmodelViewComponent,
        // ScreenViewComponent,
        // CommandViewComponent,
        // ProcessViewComponent,
    ],
    templateUrl: './slice-view.component.html',
    styleUrl: './slice-view.component.scss'
})
export class SliceViewComponent {
    slice = input.required<EMSlice>();

    // edit = model(false);

    // drop(event: CdkDragDrop<string[]>) {
    //     moveItemInArray(this.slice().elements, event.previousIndex, event.currentIndex);
    // }

    // toggleEdit() {
    //     this.edit.update(s => !s);
    // }

}
