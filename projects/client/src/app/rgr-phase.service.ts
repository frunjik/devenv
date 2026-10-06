import { Injectable, inject } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { BackendService, type RgrPhase } from './backend.service';

@Injectable({ providedIn: 'root' })
export class RgrPhaseService {
    phase: RgrPhase | null = null;
    errorMessage = '';

    private readonly backend = inject(BackendService);
    private polling?: Subscription;

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
        this.backend.getRgrPhase().subscribe({
            next: phase => {
                this.phase = phase;
                this.errorMessage = '';
            },
            error: (error: Error) => {
                this.phase = null;
                this.errorMessage = error.message;
            },
        });
    }
}
