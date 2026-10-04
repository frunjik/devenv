import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { BackendService } from './backend.service';
import { CommitMessageDialogComponent } from './commit-message-dialog/commit-message-dialog.component';
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
    isCommitDialogOpen = false;
    private snackbar = inject(MatSnackBar);
    private dialog = inject(MatDialog);
    private router = inject(Router);

    constructor(public bs: BackendService) {
    }

    get host(): string {
        return this.bs.host;
    }

    commitChanges(): void {
        if (this.isCommitting || this.isCommitDialogOpen) {
            return;
        }
        this.isCommitDialogOpen = true;
        if (this.router.url === '/git/log') {
            this.promptForCommitMessage();
            return;
        }

        void this.router.navigateByUrl('/git/log')
            .then(navigated => {
                if (navigated) {
                    this.promptForCommitMessage();
                } else {
                    this.isCommitDialogOpen = false;
                }
            })
            .catch((error: unknown) => {
                this.isCommitDialogOpen = false;
                this.showCommitMessage(
                    error instanceof Error ? error.message : 'Unable to open the Git log.',
                    true,
                );
            });
    }

    private promptForCommitMessage(): void {
        this.dialog.open(CommitMessageDialogComponent, {
            width: 'min(32rem, calc(100vw - 2rem))',
            ariaLabel: 'Commit changes',
        }).afterClosed().subscribe(message => {
            this.isCommitDialogOpen = false;
            if (message) {
                this.commitWithMessage(message);
            }
        });
    }

    private commitWithMessage(message: string): void {
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
