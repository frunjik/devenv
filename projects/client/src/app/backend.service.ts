import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { PPTFolderEntry, PPTResult } from '@ppt';

@Injectable({
    providedIn: 'root',
})
export class BackendService {

    private defaultHost = 'http://localhost:3000/';
    private httpservice = inject(HttpClient);

    constructor() { }

    get host(): string {
        return (((window as unknown) as any).host) ?? this.defaultHost
    }

    runTest(testname: string): Observable<string> {
        return this.get<string>(`tests/${testname}`)
            .pipe(
                catchError(err => {
                    this.logError(`runTest("${testname}")`, err);
                    return of('');
                })
            );
    }

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

    logError(message: string, e: Error) {
        console.error(`ERROR BackendService.${message}`, e);
        alert(message);
    }

    private get<T>(resource: string): Observable<T> {
        return this.httpservice.get<PPTResult<T>>(this.host + resource)
            .pipe(
                map(data => data.success!),
            );
    }

    private post<T>(resource: string, data: any): Observable<T> {
        return this.httpservice.post<PPTResult<T>>(this.host + resource, data)
            .pipe(
                map(data => data.success!),
            );
    }
}
