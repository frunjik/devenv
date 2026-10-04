import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GitLogRefreshService {
    private readonly refreshRequests = new Subject<void>();
    readonly refreshRequested$ = this.refreshRequests.asObservable();

    refresh(): void {
        this.refreshRequests.next();
    }
}
