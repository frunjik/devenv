import { Injectable, inject } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';
import { BackendService, type GitLogEntry } from './backend.service';

@Injectable({ providedIn: 'root' })
export class GitLogRefreshService {
    private readonly backend = inject(BackendService);
    private readonly refreshedEntries = new Subject<GitLogEntry[]>();
    readonly refreshedEntries$ = this.refreshedEntries.asObservable();

    refresh(): Observable<GitLogEntry[]> {
        return this.backend.getGitLog().pipe(
            tap(entries => this.refreshedEntries.next(entries)),
        );
    }
}
