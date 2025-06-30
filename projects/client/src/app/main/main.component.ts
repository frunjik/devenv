import { Component, inject, input, signal } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { SlicesViewComponent } from './slices-view/slices-view.component';
import { EMSlice } from '@shared';
import { Observable, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { AsyncPipe, CommonModule } from '@angular/common';
import { AppStateService } from '../app-state.service';
import { AppApiService } from '../app-api.service';
import { PPTBoxComponent } from '../ppt/box/box.component';
import { PPTColComponent } from '../ppt/col/col.component';
import { PPTRowComponent } from '../ppt/row/row.component';
import { PPTGridComponent } from '../ppt/grid/grid.component';
import { EditorComponent } from '../editor/editor.component';
import { TextEditorComponent } from '../text-editor/text-editor.component';
import { FileEditorComponent } from '../file-editor/file-editor.component';
import { PPTDict, PPTItem } from '@ppt';
import { PPTItemDataSource, TableViewComponent } from '../table-view/table-view.component';
import { MatTableDataSource } from '@angular/material/table';
import { exampleItems, exampleItemColumns, exampleSlices, exampleSlice } from '../data';
import { SliceViewComponent } from './slice-view/slice-view.component';
import { MatButton } from '@angular/material/button';
import { SliceEditorComponent } from './slice-editor/slice-editor.component';

export interface XState {
    data: Record<string, Object>,
    meta: Record<string, Object>,
}

@Component({
    selector: 'app-main',
    imports: [
        CommonModule,
        // AsyncPipe,
        // CdkDropList, CdkDrag,
        MatToolbar,
        MatIcon,
        MatButton,
        // MatSidenavModule,
        // MatListModule,
        // MatExpansionModule,
        // MatTabsModule,
        SliceViewComponent,
        // SlicesViewComponent,
        SliceEditorComponent,
        // PPTBoxComponent,
        // PPTColComponent,
        PPTRowComponent,
        // PPTGridComponent,
        EditorComponent,
        // FileEditorComponent,
        // TextEditorComponent,
        TableViewComponent
        // ScratchComponent,
    ],
    templateUrl: './main.component.html',
    styleUrl: './main.component.scss'
})
export class MainComponent {

    filename = 'client/README.md';
    fileContent = 'TEST fileContent';

    apiService: AppApiService = inject(AppApiService);
    appStateService: AppStateService = inject(AppStateService);

    itemDataSource: PPTItemDataSource = {
        ds: new MatTableDataSource(exampleSlices as PPTItem[]),
        columns: exampleItemColumns
    };

    // slices$: Observable<EMSlice[]> = this.appStateService.slices.asObservable();
    slicesDict$: Observable<PPTDict<EMSlice>> = this.appStateService.slicesDict.asObservable();
    slicesList = signal<EMSlice[]>([]);
    // slices = toSignal(this.slices$)

    selectedSlice?: EMSlice;
    updatingSlice = signal(false);

    editMode = this.appStateService.editMode;

    buttons = [
        'thumb_up',
        'arrow_forward',
        'label',
        'settings',
        'list_alt',
        'article',
        'data_object',
        'home',
        'help',
        'update',
        'analytics',
        'bookmark',
        'gavel',
        'source',
        'table_view',
        'expand',
        'change_history',
        'assignment_turned_in'
    ];

    get canInsert(): boolean {
        return !this.updatingSlice();
    }

    get canUpdate(): boolean {
        return !this.updatingSlice() && !!this.selectedSlice;
    }

    get canDelete(): boolean {
        return !this.updatingSlice() && !!this.selectedSlice;
    }

    constructor() {
        this.slicesDict$.subscribe(
            data => {
                const dataAsList = Object.values(data);
                this.slicesList.set(dataAsList);
                // TODO: connect ?
                // TODO: connect ?
                this.itemDataSource.ds.data = dataAsList;
            }
        )
    }

    menuClicked() {
        this.toggleEditMode();
    }

    rowClicked(row: PPTItem) {
        // alert(row)
        if (this.selectedSlice === row) {
            this.selectSlice(undefined);
        } else {
            this.selectSlice(row as EMSlice);
        }
    }

    selectSlice(slice: EMSlice | undefined) {
        // alert(row)
        this.selectedSlice = slice;
        // this.updateSlice();
    }

    toggleEditMode() {
        this.apiService.toggleEditMode();
    }

    insertSlice() {
        this.selectedSlice = {
            id: '*',
            name: 'New Slice',
            elements: [
                ...exampleSlice.elements
            ]
        };
        this.updatingSlice.set(true);
    }

    updateSlice() {
        this.updatingSlice.set(true);
    }

    commitSlice() {
        this.updatingSlice.set(false);
        const selectedSlice = this.selectedSlice!;
        selectedSlice.id = selectedSlice.name;
        this.apiService.postPatches([
            {
                op: 'replace',
                path: ['slices', selectedSlice.id],
                value: selectedSlice
            },
        ]);

        // TODO: Persist
        // alert('TODO: Persist');
    }

    deleteSlice() {
        const selectedSlice = this.selectedSlice!;
        if (selectedSlice) {
            this.apiService.postPatches([
                {
                    op: 'remove',
                    path: ['slices', selectedSlice.id],
                },
            ]);
            this.cancelSlice();
        }
    }

    cancelSlice() {
        this.updatingSlice.set(false);
        this.selectedSlice = undefined;
    }

    submitText(text: string) {
        alert(
            text
        )
    }
}
