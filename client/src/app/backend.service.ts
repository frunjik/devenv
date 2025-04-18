import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { SuccessResponseBody, FolderEntry } from '@shared';

@Injectable({
    providedIn: 'root'
})
export class BackendService {

    private server = 'http://localhost:3000/';

    constructor(private httpservice: HttpClient) { }

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

    loadFolder(pathname: string): Observable<FolderEntry[]> {
        return this.get<FolderEntry[]>(`folders?path=${pathname}`)
            .pipe(
                catchError(err => {
                    this.logError(`loadFolder("${pathname}")`, err);
                    return of([]);
                })
            );
    }

    logError(message: string, e: Error) {
        console.error(`ERROR BackendService.${message}`, e);
    }


    private get<T>(resource: string): Observable<T> {
        return this.httpservice.get<SuccessResponseBody<T>>(this.server + resource)
            .pipe(
                map(data => data.data),
            );
    }

    private post<T>(resource: string, data: any): Observable<T> {
        return this.httpservice.post<SuccessResponseBody<T>>(this.server + resource, data)
            .pipe(
                map(data => data.data),
            );
    }


}
