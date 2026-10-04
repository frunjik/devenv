import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription, timer } from 'rxjs';
import { BackendService, type GitStatus } from './backend.service';

@Injectable({ providedIn: 'root' })
export class GitStatusService {
    status: GitStatus | null = null;
    hasError = false;
    errorMessage = '';

    private backend = inject(BackendService);
    private polling?: Subscription;
    private isLoading = false;

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

    get label(): string {
        if (this.hasError) {
            return 'Git status unavailable';
        }
        if (!this.status) {
            return 'Checking changes…';
        }
        const count = this.status.files.length;
        return count === 0 ? 'No open changes' : `${count} open change${count === 1 ? '' : 's'}`;
    }

    get count(): string {
        if (this.hasError) {
            return '!';
        }
        return this.status ? String(this.status.files.length) : '…';
    }

    get tooltip(): string {
        if (this.hasError) {
            return this.errorMessage;
        }
        if (!this.status) {
            return this.label;
        }

        const branch = this.status.branch ?? 'Detached HEAD';
        const tracking = [
            this.status.ahead > 0 ? `${this.status.ahead} ahead` : '',
            this.status.behind > 0 ? `${this.status.behind} behind` : '',
        ].filter(Boolean).join(', ');
        const lines = [`Branch: ${branch}${tracking ? ` (${tracking})` : ''}`];

        if (this.status.files.length === 0) {
            lines.push('No open changes');
            return lines.join('\n');
        }

        lines.push(...this.status.files.slice(0, 8).map(file => {
            const fileStatuses = [
                file.conflicted ? 'conflict' : '',
                file.untracked ? 'untracked' : '',
                file.staged ? 'staged' : '',
                file.unstaged && !file.untracked ? 'unstaged' : '',
            ].filter(Boolean);
            const path = file.originalPath
                ? `${file.originalPath} → ${file.path}`
                : file.path;
            return `${path} (${fileStatuses.join(', ') || 'changed'})`;
        }));

        if (this.status.files.length > 8) {
            lines.push(`…and ${this.status.files.length - 8} more`);
        }
        return lines.join('\n');
    }

    refresh(): void {
        if (this.isLoading) {
            return;
        }
        this.isLoading = true;
        this.backend.getGitStatus().subscribe({
            next: status => {
                this.status = status;
                this.hasError = false;
                this.errorMessage = '';
                this.isLoading = false;
            },
            error: (error: HttpErrorResponse) => {
                this.status = null;
                this.hasError = true;
                this.errorMessage = this.getErrorMessage(error);
                this.isLoading = false;
            },
        });
    }

    private getErrorMessage(error: HttpErrorResponse): string {
        if (error.error
            && typeof error.error === 'object' && 'error' in error.error
            && error.error.error && typeof error.error.error === 'object'
            && 'message' in error.error.error && typeof error.error.error.message === 'string') {
            return error.error.error.message;
        }
        return error.message;
    }
}
