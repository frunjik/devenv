import { Component, input, output, signal } from '@angular/core';
import { exampleSlice } from '../data';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { EMSlice } from '@shared';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ElementViewComponent } from '../main/element-view/element-view.component';
import { ValueEditorComponent } from '../value-editor/value-editor.component';

@Component({
    selector: 'app-list-editor',
    imports: [
        CommonModule,
        // AsyncPipe,
        CdkDropList, CdkDrag,
        MatButtonModule,
        MatToolbarModule,

        ValueEditorComponent,
        // ElementViewComponent
    ],
    templateUrl: './list-editor.component.html',
    styleUrl: './list-editor.component.scss'
})
export class ListEditorComponent {

    list = input<Array<any>>([1, 2, 3]);

    slice = input(exampleSlice);

    cancel = output();
    commit = output<EMSlice>();

    changed = signal(false);

    drop(event: CdkDragDrop<string[]>) {
        this.changed.set(true);
        moveItemInArray(this.slice().elements, event.previousIndex, event.currentIndex);
    }

    setSliceName(event: any) {
        this.slice().name = event.target.innerText.trim();
    }
}
