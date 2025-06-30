import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { SuccessResponseBody, PPTFolderEntry } from '@ppt';

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

    protected logError(message: string, e: Error) {
        console.error(`ERROR ${message}`, e);
    }

    protected get<T>(resource: string): Observable<T> {
        return this.httpservice.get<SuccessResponseBody<T>>(this.host + resource)
            .pipe(
                map(data => data.data),
            );
    }

    protected post<T>(resource: string, data: any): Observable<T> {
        return this.httpservice.post<SuccessResponseBody<T>>(this.host + resource, data)
            .pipe(
                map(data => data.data),
            );
    }
}
