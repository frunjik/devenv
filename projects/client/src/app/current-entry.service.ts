import { Injectable, inject } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { BackendService } from './backend.service';

@Injectable({ providedIn: 'root' })
export class CurrentEntryService {
    entry: string | null = null;
    errorMessage = '';

    private readonly backend = inject(BackendService);
    private polling?: Subscription;

    startPolling(): void {
        if (this.polling) {
            return;
        }
        this.refresh();
        this.polling = timer(30_000, 30_000).subscribe(this.refresh.bind(this));
    }

    stopPolling(): void {
        this.polling?.unsubscribe();
        this.polling = undefined;
    }

    refresh(): void {
        this.backend.getCurrentEntry().subscribe({
            next: entry => {
                this.entry = entry;
                this.errorMessage = '';
            },
            error: (error: Error) => {
                this.entry = null;
                this.errorMessage = error.message;
            },
        });
    }
}
