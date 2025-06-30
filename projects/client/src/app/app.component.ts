import { Component, inject, Signal, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';
import { DevendService } from './devenv.service';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ScratchComponent } from './temp/scratch-wip/scratch.component';
import { MatIconModule } from '@angular/material/icon';
import { BackendService } from './backend.service';
import { PPTModelService } from './ppt-model.service';
import { AppStateService } from './app-state.service';
import { EMSlice } from '@shared';
import { SliceViewComponent } from './main/slice-view/slice-view.component';
import { SliceEditorComponent } from './main/slice-editor/slice-editor.component';
import { AppApiService } from './app-api.service';
import { SlicesViewComponent } from './main/slices-view/slices-view.component';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { PPTList } from '@ppt';
import { TableViewComponent } from './table-view/table-view.component';
import { exampleSlice } from './data';

@Component({
    selector: 'app-root',
    imports: [
        // AsyncPipe,
        CommonModule,
        FormsModule, 
        // ScratchComponent,
        MatIconModule,
        MatSidenavModule, MatCheckboxModule, MatButtonModule,
        RouterOutlet, MatToolbarModule,
        // SliceViewComponent,
        // SlicesViewComponent,
        // SliceEditorComponent,
        // TableViewComponent
    ],
    // providers: [

    // ]
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
    appApiService: AppApiService = inject(AppApiService);
    pptModelService: PPTModelService = inject(PPTModelService);
    appStateService: AppStateService = inject(AppStateService);

    title = 'DevEnv';
    editMode: Signal<boolean> = this.appStateService.editMode;

    slicesDict$ = this.appStateService.slicesDict$;
    slicesList$: Observable<any> = this.slicesDict$.pipe(
        tap(data => Object.values(data) as PPTList<EMSlice>),
    );

    constructor() {
        // this.pptModelService.postPatches(patches).subscribe();
        this.pptModelService.restore().subscribe({
            complete: () => this.refreshState()
        });
    }

    sideBarOpened() {}
    sideBarClosed() {}

    slice = exampleSlice;

    refreshState() {
        this.appApiService.refreshState();
    }

    commitSlice(slice: EMSlice) {
        alert(
            JSON.stringify(
                this.slice
            )
        )
    }
}


