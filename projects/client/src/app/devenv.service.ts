import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { PPTFolderEntry } from '@ppt';
import { BackendService } from './backend.service';

@Injectable({
    providedIn: 'root',
})
export class DevendService extends BackendService {

    loadFile(pathname: string): Observable<string> {
        return this.get<string>(`files?path=${pathname}`)
            .pipe(
                catchError(err => {
                    this.logError(`loadFile("${pathname}")`, err);
                    return of('');
                })
            );
    }

    saveFile(pathname: string, contents: string): Observable<string> {
        return this.post<any>(`files?path=${pathname}`, {data: contents})
            .pipe(
                catchError(err => {
                    this.logError(`saveFile("${pathname}")`, err);
                    return of('');
                })
            );
    }

    loadFolder(pathname: string): Observable<PPTFolderEntry[]> {
        return this.get<PPTFolderEntry[]>(`folders?path=${pathname}`)
            .pipe(
                catchError(err => {
                    this.logError(`loadFolder("${pathname}")`, err);
                    return of([]);
                })
            );
    }
}
