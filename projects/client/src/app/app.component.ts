import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { BackendService } from './backend.service';
import { CommitMessageDialogComponent } from './commit-message-dialog/commit-message-dialog.component';
import { CurrentEntryService } from './current-entry.service';
import { GitLogRefreshService } from './git-log-refresh.service';
import { GitStatusService } from './git-status.service';

@Component({
    selector: 'app-root',
    imports: [NgClass, RouterLink, RouterOutlet, MatButtonModule, MatSnackBarModule, MatToolbarModule, MatTooltipModule],
    // providers: [

    // ]
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
    title = 'DevEnv';
    isCommitting = false;
    isCommitDialogOpen = false;
    readonly gitStatus = inject(GitStatusService);
    readonly currentEntry = inject(CurrentEntryService);
    private gitLogRefresh = inject(GitLogRefreshService);
    private snackbar = inject(MatSnackBar);
    private dialog = inject(MatDialog);
    private router = inject(Router);

    constructor(public bs: BackendService) {
    }

    get host(): string {
        return this.bs.host;
    }

    ngOnInit(): void {
        this.gitStatus.startPolling();
        this.currentEntry.startPolling();
    }

    ngOnDestroy(): void {
        this.gitStatus.stopPolling();
        this.currentEntry.stopPolling();
    }

    commitChanges(): void {
        if (this.isCommitting || this.isCommitDialogOpen) {
            return;
        }
        this.isCommitDialogOpen = true;
        if (this.router.url === '/git/log') {
            this.refreshGitLogBeforeCommit();
            return;
        }

        void this.router.navigateByUrl('/git/log')
            .then(navigated => {
                if (navigated) {
                    this.refreshGitLogBeforeCommit();
                } else {
                    this.isCommitDialogOpen = false;
                }
            })
            .catch((error: Error) => {
                this.isCommitDialogOpen = false;
                this.showCommitMessage(
                    error.message,
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
                this.gitStatus.refresh();
                this.gitLogRefresh.refresh().subscribe({
                    error: error => this.showCommitMessage(
                        `Changes committed, but the Git log could not be refreshed: ${error.message}`,
                        true,
                    ),
                });
            },
            error: error => {
                this.showCommitMessage(this.getCommitError(error), true);
                this.isCommitting = false;
            },
        });
    }

    private refreshGitLogBeforeCommit(): void {
        this.gitLogRefresh.refresh().subscribe({
            next: () => this.promptForCommitMessage(),
            error: error => {
                this.isCommitDialogOpen = false;
                this.showCommitMessage(
                    `Could not refresh Git log: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    true,
                );
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
