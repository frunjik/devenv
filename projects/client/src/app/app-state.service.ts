import { Injectable, signal } from '@angular/core';
import { PPTDict } from '@ppt';
import { EMSlice } from '@shared';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AppStateService {

    initialEditMode = false;

    editMode = signal<boolean>(this.initialEditMode);
    sideBarOpen = signal<boolean>(this.initialEditMode);

    public readonly state = new BehaviorSubject<Object>({});
    public readonly slicesDict = new BehaviorSubject<PPTDict<EMSlice>>({});

    public readonly slicesDict$ = this.slicesDict.asObservable();

    constructor() { }

    updateState(data: any) {
        this.state.next(data);
        // TODO: typing - data.meta.slices
        this.updateSlices(data.meta.slices);

        // console.log(data.meta.slices)

    }

    updateSlices(data: PPTDict<EMSlice>) {
        this.slicesDict.next(data);
    }

    toggleEditMode() {
        this.editMode.update(s => !s);
        this.sideBarOpen.set(this.editMode());
    }

}
