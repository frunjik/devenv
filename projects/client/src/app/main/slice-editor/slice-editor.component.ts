import { CdkDropList, CdkDrag, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { EMSlice } from '@shared';
import { ElementViewComponent } from '../element-view/element-view.component';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { exampleSlice } from '../../data';

// const slice: EMSlice = {
//     id: 'TEST',
//     elements: [
//         {
//             id: 'event',
//             type: 'event',
//             name: 'Event'
//         },
//         {
//             id: 'command',
//             type: 'command',
//             name: 'Command'
//         },
//         {
//             id: 'screen',
//             type: 'screen',
//             name: 'Screen'
//         },
//         {
//             id: 'process',
//             type: 'process',
//             name: 'Process'
//         },
//         {
//             id: 'readmodel',
//             type: 'readmodel',
//             name: 'ReadModel'
//         },
//     ]
// };

@Component({
    selector: 'em-slice-editor',
    imports: [
        CommonModule,
        // AsyncPipe,
        CdkDropList, CdkDrag,
        MatButtonModule,
        MatToolbarModule,

        ElementViewComponent
    ],
    templateUrl: './slice-editor.component.html',
    styleUrl: './slice-editor.component.scss'
})
export class SliceEditorComponent {

    slice = input<EMSlice>(exampleSlice);
    // sliceName = input(this.slice().name);

    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.slice().elements, event.previousIndex, event.currentIndex);
    }

    setSliceName(event: any) {
        this.slice().name = event.target.innerText.trim();
    }

    cancel = output();
    commit = output<EMSlice>();
}
