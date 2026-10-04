import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterOutlet } from '@angular/router';
import { BackendService } from './backend.service';
// import pipe from 
@Component({
    selector: 'app-root',
    imports: [RouterLink, RouterOutlet, MatButtonModule, MatSnackBarModule, MatToolbarModule],
    // providers: [

    // ]
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
    title = 'DevEnv';
    isCommitting = false;
    private snackbar = inject(MatSnackBar);
    
    constructor(public bs: BackendService) {
    }

    get host(): string {
        return this.bs.host;
    }

    commitChanges(): void {
        if (this.isCommitting) {
            return;
        }
        const message = window.prompt('Commit message');
        if (message === null) {
            return;
        }
        if (!message.trim()) {
            this.showCommitMessage('A commit message is required.', true);
            return;
        }

        this.isCommitting = true;
        this.bs.commitChanges(message).subscribe({
            next: result => {
                this.showCommitMessage(result.stdout.trim() || 'Changes committed.');
                this.isCommitting = false;
            },
            error: error => {
                this.showCommitMessage(this.getCommitError(error), true);
                this.isCommitting = false;
            },
        });
    }

    private showCommitMessage(message: string, isError = false): void {
        this.snackbar.open(message, 'Dismiss', {
            duration: 5000,
            panelClass: isError ? 'commit-snackbar-error' : 'commit-snackbar-success',
        });
    }

    private getCommitError(error: unknown): string {
        if (error instanceof HttpErrorResponse && error.error
            && typeof error.error === 'object' && 'error' in error.error
            && error.error.error && typeof error.error.error === 'object'
            && 'message' in error.error.error && typeof error.error.error.message === 'string') {
            return error.error.error.message;
        }
        return error instanceof Error ? error.message : 'Unable to commit changes.';
    }
}
