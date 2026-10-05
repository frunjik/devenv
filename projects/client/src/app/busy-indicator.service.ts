import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BusyIndicatorService {
    readonly isBusy = signal(false);
    private activeRequests = 0;

    requestStarted(): void {
        this.activeRequests++;
        this.isBusy.set(true);
    }

    requestFinished(): void {
        this.activeRequests--;
        this.isBusy.set(this.activeRequests > 0);
    }
}
