import { Injectable, inject } from '@angular/core';
import { BackendService } from './backend.service';

@Injectable({ providedIn: 'root' })
export class CurrentTaskService {
    entry: string | null = null;
    errorMessage = '';
    isLoading = false;

    private readonly backend = inject(BackendService);

    get displayEntry(): string | null {
        if (!this.entry) {
            return null;
        }
        try {
            const feature: unknown = JSON.parse(this.entry);
            if (typeof feature === 'object' && feature !== null
                && typeof (feature as { description?: unknown }).description === 'string') {
                return (feature as { description: string }).description;
            }
        } catch {
            // Not a JSON feature record; fall through to the legacy task-line format.
        }
        return this.entry
            .replace(/^- \[[^\]]+\]\s*/, '')
            .replace(/\s+<!-- feature-id:[0-9a-f-]+ -->$/, '');
    }

    refresh(): void {
        this.isLoading = true;
        this.errorMessage = '';
        this.backend.getCurrentTask().subscribe({
            next: entry => {
                this.entry = entry;
                this.isLoading = false;
            },
            error: (error: Error) => {
                this.entry = null;
                this.errorMessage = error.message;
                this.isLoading = false;
            },
        });
    }
}
