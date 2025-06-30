import { Component, inject } from '@angular/core';
import { PPTModelService } from '../../ppt-model.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SlicesViewComponent } from '../../main/slices-view/slices-view.component';
import { PPTBoxComponent } from '../../ppt/box/box.component';
import { PPTColComponent } from '../../ppt/col/col.component';
import { PPTFormComponent } from '../../ppt/form/ppt-form/ppt-form.component';
import { PPTGridComponent } from '../../ppt/grid/grid.component';
import { PPTRowComponent } from '../../ppt/row/row.component';
import { AppApiService } from '../../app-api.service';
import { AppStateService } from '../../app-state.service';
import { TreeViewComponent } from '../../main/tree-view/tree-view.component';
import { ListEditorComponent } from '../../list-editor/list-editor.component';
import { ValueEditorComponent } from '../../value-editor/value-editor.component';
import { ListViewComponent } from '../../list-view/list-view.component';
import { exampleItems } from '../../data';
import { DictViewComponent } from '../../dict-view/dict-view.component';
import { DictEditorComponent } from '../../dict-editor/dict-editor.component';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-scratch',
    imports: [
        CommonModule,
        // TreeViewComponent,
        // SlicesViewComponent,
        // ListEditorComponent,

        DictViewComponent,
        // DictEditorComponent,
        // ListViewComponent,
        // ValueEditorComponent,


        // PPTFormComponent,
        // PPTBoxComponent,
        // PPTColComponent,
        // PPTRowComponent,
        // PPTGridComponent,
    ],
    templateUrl: './scratch.component.html',
    styleUrl: './scratch.component.scss'
})
export class ScratchComponent {

    // list = exampleItems;

    list = [
        undefined,
        null,
        true,
        1,
        "OK",
        [1,2,3],
        {a:1, b:[2]}
    ];

    dict = {
        'a': undefined,
        'b': null,
        'c': true,
        'd': 1,
        'e': "OK",
        'f': [1,2,3],
        'g': {a:1, b:[2]}
    };

    appApiService: AppApiService = inject(AppApiService);
    appStateService: AppStateService = inject(AppStateService);
    pptModelService: PPTModelService = inject(PPTModelService);

    state$: Observable<any> = this.appStateService.state.asObservable();
    state = toSignal(this.state$);

    constructor() {
        // this.pptModelService.postPatches(patches).subscribe();
        this.pptModelService.restore().subscribe();
    }

    ngOnInit(): void {
        this.refreshState();
    }

    refreshState() {
        this.appApiService.refreshState();
    }
}
