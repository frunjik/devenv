import { Injectable, inject } from '@angular/core';
import { BackendService } from './backend.service';
import { SCHEDULER } from './scheduler';

@Injectable({ providedIn: 'root' })
export class CurrentEntryService {
    entry: string | null = null;
    errorMessage = '';

    private readonly backend = inject(BackendService);
    private readonly scheduler = inject(SCHEDULER);
    private polling?: () => void;

    get summary(): string {
        if (!this.entry) {
            return '';
        }
        try {
            const feature: unknown = JSON.parse(this.entry);
            if (typeof feature === 'object' && feature !== null
                && typeof (feature as { description?: unknown }).description === 'string') {
                return (feature as { description: string }).description;
            }
        } catch {
            // Not a JSON feature record; fall through to the legacy text format.
        }
        return this.entry.replace(/^\/\/ \[\d{4}-\d{2}-\d{2}[^\]]*\]\s*/, '');
    }

    startPolling(): void {
        if (this.polling) {
            return;
        }
        this.refresh();
        this.polling = this.scheduler.every(30_000, () => this.refresh());
    }

    stopPolling(): void {
        this.polling?.();
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
