import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { PPTFolderEntry, PPTResult } from '@ppt';

@Injectable({
    providedIn: 'root',
})
export class BackendService {

    private _defaultHost = 'http://localhost:3000/';
    private _httpservice = inject(HttpClient);

    constructor() { }

    get host(): string {
        return (((window as unknown) as any).host) ?? this._defaultHost;
    }

    runTest(testname: string, data: any): Observable<PPTResult<string>> {
        return this.post<string>(`tests/${testname}`, data)
            // .pipe(
            //     catchError(err => {
            //         this.logError(`runTest("${testname}")`, err);
            //         return of();
            //     })
            // )
            ;
    }

    loadFile(fullpathfilename: string): Observable<string> {
        return this.get<string>(`files?path=${fullpathfilename}`)
            .pipe(
                map(data => data.success!),
                catchError(err => {
                    this.logError(`loadFile("${fullpathfilename}")`, err);
                    return of('');
                })
            );
    }

    saveFile(fullpathfilename: string, contents: string): Observable<void> {
        return this.post<any>(`files?path=${fullpathfilename}`, {data: contents})
            .pipe(
                map(data => data.success!),
                catchError(err => {
                    this.logError(`saveFile("${fullpathfilename}")`, err);
                    return of();
                })
            );
    }

    loadFolderEntries(fullpathfilename: string): Observable<PPTFolderEntry[]> {
        return this.get<PPTFolderEntry[]>(`folders?path=${fullpathfilename}`)
            .pipe(
                map(data => data.success!),
                catchError(err => {
                    this.logError(`loadFolderEntries("${fullpathfilename}")`, err);
                    return of([]);
                })
            );
    }

    logError(message: string, e: Error) {
        console.error(`ERROR BackendService.${message}`, e);
        alert(message);
    }

    private get<T>(resource: string): Observable<PPTResult<T>> {
        return this._httpservice.get<PPTResult<T>>(this.host + resource)
            // .pipe(
            //     map(data => data.success!),
            // );
    }

    private post<T>(resource: string, data: any): Observable<PPTResult<T>> {
        return this._httpservice.post<PPTResult<T>>(this.host + resource, data)
            // .pipe(
            //     map(data => data.success!),
            // );
    }
}
