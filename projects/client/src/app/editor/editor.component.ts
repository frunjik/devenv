import { Component, computed, inject, input } from '@angular/core';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { SlicesViewComponent } from '../main/slices-view/slices-view.component';
import { AsyncPipe, CommonModule } from '@angular/common';
import { PPTBoxComponent } from '../ppt/box/box.component';
import { PPTColComponent } from '../ppt/col/col.component';
import { PPTRowComponent } from '../ppt/row/row.component';
import { PPTGridComponent } from '../ppt/grid/grid.component';
import { type PPTDict, type PPTItem, type PPTList } from '@ppt';
import { SliceViewComponent } from '../main/slice-view/slice-view.component';
import { EventViewComponent } from '../main/event-view/event-view.component';
import { EMElement, EMSlice } from '@shared';
import { ElementViewComponent } from '../main/element-view/element-view.component';
import { Observable } from 'rxjs';
import { AppApiService } from '../app-api.service';
import { ObjectEditorComponent } from '../object-editor/object-editor.component';
import { exampleSlice } from '../data';

function deepFreeze(object: any) {
    // Retrieve the property names defined on object
    const propNames = Reflect.ownKeys(object);

    // Freeze properties before freezing self
    for (const name of propNames) {
        const value = object[name];

        if ((value && typeof value === "object") || typeof value === "function") {
            deepFreeze(value);
        }
    }

    return Object.freeze(object);
}

// export type PPTList<T> = ReadonlyArray<T>;
// export type PPTDict<T> = Record<string, T>;

export interface PPTState<M,D> {
    readonly meta: M,
    readonly data: D,
}

export type PPTEditorState = PPTState<PPTList<PPTItem>, PPTDict<PPTList<string>>>;

export const emptyState: PPTState<Object, Object> = deepFreeze({
    meta: {},
    data: {}
});

const editorState: PPTEditorState = {
    meta: [
        {
            id: '',
            type: '',
            name: 'elements',
            title: 'Elements'
        },
        {
            id: '',
            type: '',
            name: 'components',
            title: 'Components'
        },
        {
            id: '',
            type: '',
            name: 'data',
            title: 'Data'
        },
    ],
    data: {
        elements: [
            'Slices',
            'Events',
            'Commands',
            'Processes',
            'Screen',
            'ReadModel',
        ],
        components: [
            'Box',
            'Col',
            'Row',
            'Grid',
            'List',
            'Form',
            '-',
            'View*',
        ],
        data: [
            'Slices',
            'Events',
            'Commands',
            'Processes',
            'Screen',
            'ReadModel',
            '-',
            'Fields',
            'Models',
        ],
        // movies: [
        //     'Toolbar',
        //     'SlicesView',
        //     'EventsView',
        // ],
        meta: [
            'Fields',
            'Models',
            '-',
            'State',
        ]
    }
}

@Component({
    selector: 'app-editor',
    imports: [
        CommonModule,
        // AsyncPipe,
        CdkDropList, CdkDrag,
        // MatToolbar,
        // MatIcon,
        MatSidenavModule,
        MatListModule,
        MatExpansionModule,
        MatTabsModule,
        // SliceViewComponent,
        // SlicesViewComponent,
        // PPTBoxComponent,
        PPTColComponent,
        PPTRowComponent,
        // PPTGridComponent,
        // EventViewComponent,
        ElementViewComponent,
        // ObjectEditorComponent
        // ScratchComponent,
    ],
    templateUrl: './editor.component.html',
    styleUrl: './editor.component.scss'
})
export class EditorComponent {

    apiService: AppApiService = inject(AppApiService);
    // appStateService: AppStateService = inject(AppStateService);
    // slices$: Observable<EMSlice[]> = this.apiService.slices$;

    // state = input<Object>();
    editorState = input<PPTEditorState>(editorState);

    slice = exampleSlice;
    elements: EMElement[] = this.slice.elements;

    // elements: EMElement[] = [
    //     {
    //         id: 'Screen',
    //         name: 'Screen',
    //         type: 'screen'
    //     },
    //     {
    //         id: 'Event',
    //         name: 'Event',
    //         type: 'event'
    //     },
    // ];


    get topics(): PPTList<PPTItem> {
        return this.editorState().meta;
    }

    itemsByTopic(topic: PPTItem): PPTList<string> {
        return this.editorState().data[topic.name];
    }

    properties = [
        'Slices',
        'Events',
        'Commands',
        'Processes',
        'Screen',
        'ReadModel',
    ];

    itemClicked(item: PPTItem, index: number) {
    }

    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.elements, event.previousIndex, event.currentIndex);
    }

    actionClicked(index: number) {
    }
}
