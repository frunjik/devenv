import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { BackendService } from './backend.service';
import { type PPTModel } from '@ppt';
import { EMSlice } from '@shared';
import { Patch } from 'immer';

@Injectable({
    providedIn: 'root',
})
export class PPTModelService extends BackendService {

    postPatches(patches: Patch[]): Observable<PPTModel[]> {
        return this.post<PPTModel[]>(`ppt/patches`, patches)
            .pipe(
                catchError(err => {
                    this.logError(`postPatches(${patches})`, err);
                    return of([]);
                })
            );
    }

    restore(): Observable<any> {
        return this.get<any>(`ppt/restore`)
            .pipe(
                catchError(err => {
                    this.logError(`getState()`, err);
                    return of({});
                })
            );
    }

    getState(): Observable<any> {
        return this.get<any>(`ppt/state`)
            .pipe(
                catchError(err => {
                    this.logError(`getState()`, err);
                    return of({});
                })
            );
    }

    getModels(): Observable<PPTModel[]> {
        return this.get<PPTModel[]>(`ppt/models`)
            .pipe(
                catchError(err => {
                    this.logError(`getModels()`, err);
                    return of([]);
                })
            );
    }

    getSlices(): Observable<EMSlice[]> {
        return this.get<EMSlice[]>(`ppt/slices`)
            .pipe(
                catchError(err => {
                    this.logError(`getSlices()`, err);
                    return of([]);
                })
            );
    }
}
