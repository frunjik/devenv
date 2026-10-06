import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription, timer } from 'rxjs';
import { BackendService, type TestRunCacheStatus } from './backend.service';

@Injectable({ providedIn: 'root' })
export class TestRunCacheStatusService {
    status: TestRunCacheStatus | null = null;
    error = '';
    isLoading = false;

    private polling?: Subscription;

    constructor(private backend: BackendService) {}

    startPolling(): void {
        if (this.polling) {
            return;
        }
        this.refresh();
        this.polling = timer(30_000, 30_000).subscribe(() => this.refresh());
    }

    stopPolling(): void {
        this.polling?.unsubscribe();
        this.polling = undefined;
    }

    refresh(): void {
        this.isLoading = true;
        this.error = '';
        this.backend.getTestRunCacheStatus().subscribe({
            next: status => {
                this.status = status;
                this.isLoading = false;
            },
            error: (error: Error) => {
                this.error = this.getErrorMessage(error);
                this.isLoading = false;
            },
        });
    }

    private getErrorMessage(error: Error): string {
        if (error instanceof HttpErrorResponse && error.error
            && typeof error.error === 'object' && 'error' in error.error
            && error.error.error && typeof error.error.error === 'object'
            && 'message' in error.error.error && typeof error.error.error.message === 'string') {
            return error.error.error.message;
        }
        return error.message;
    }
}
