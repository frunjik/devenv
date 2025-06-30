import { inject, Injectable } from '@angular/core';
import { PPTModelService } from './ppt-model.service';
import { AppStateService } from './app-state.service';
import { EMSlice } from '@shared';
import { Observable, tap } from 'rxjs';
import { PPTDict } from '@ppt';
import { Patch } from 'immer';

@Injectable({
    providedIn: 'root'
})
export class AppApiService {

    readonly appStateService: AppStateService = inject(AppStateService);
    readonly pptModelService: PPTModelService = inject(PPTModelService);

    readonly state$: Observable<Object> = this.appStateService.state.asObservable();
    readonly slices$: Observable<PPTDict<EMSlice>> = this.appStateService.slicesDict.asObservable();

    // readonly slices$: Observable<EMSlice[]> = this.state$
    //     .pipe(
    //         tap((data: any) => data.meta.slices as EMSlice[])
    //     );

    constructor() { }

    toggleEditMode() {
        this.appStateService.toggleEditMode();
    }

    // refreshSlices() {
    //     this.pptModelService
    //         .getSlices()
    //         .subscribe((data) => {
    //             this.appStateService.updateSlices(data);
    //         });
    // }

    postPatches(patches: Patch[]) {
        this.pptModelService
            .postPatches(patches)
            .subscribe((data) => {
                this.refreshState();
            });
    }

    refreshState() {
        this.pptModelService
            .getState()
            .subscribe((data) => {
                this.appStateService.updateState(data);
            });
    }

}
