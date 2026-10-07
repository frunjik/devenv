import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BackendService } from '../backend.service';

@Component({
    selector: 'app-devenv-clone-dialog',
    standalone: true,
    imports: [FormsModule, MatButtonModule, MatDialogModule, MatProgressBarModule, MatSnackBarModule],
    templateUrl: './devenv-clone-dialog.component.html',
    styleUrl: './devenv-clone-dialog.component.scss',
})
export class DevEnvCloneDialogComponent {
    destination = '';
    replaceExisting = false;
    exporting = false;
    errorMessage = '';
    private readonly backend = inject(BackendService);
    private readonly dialogRef = inject(MatDialogRef<DevEnvCloneDialogComponent>);
    private readonly snackbar = inject(MatSnackBar);

    submit(): void {
        if (this.exporting) {
            return;
        }
        if (!this.destination.trim() || !this.replaceExisting) {
            this.errorMessage = 'Enter a destination and acknowledge replacement of any existing contents.';
            return;
        }

        this.exporting = true;
        this.errorMessage = '';
        this.backend.cloneDevEnv({
            destination: this.destination.trim(),
            replaceExisting: this.replaceExisting,
        }).subscribe({
            next: result => {
                this.exporting = false;
                const replacementMessage = result.replacedExisting
                    ? ' Existing destination contents were replaced.' : '';
                const warningMessage = result.warning ? ` ${result.warning}` : '';
                this.snackbar.open(
                    `Clone exported to ${result.destination}.${replacementMessage}${warningMessage}`,
                    'Dismiss',
                    {
                        duration: result.warning ? 0 : 5000,
                        panelClass: result.warning ? 'save-snackbar-error' : 'save-snackbar-success',
                    },
                );
                this.close();
            },
            error: (error: unknown) => {
                if (error instanceof HttpErrorResponse && error.error
                    && typeof error.error === 'object' && 'error' in error.error
                    && error.error.error && typeof error.error.error === 'object'
                    && 'message' in error.error.error && typeof error.error.error.message === 'string') {
                    this.errorMessage = error.error.error.message;
                } else {
                    this.errorMessage = error instanceof Error ? error.message : 'Unable to clone DevEnv.';
                }
                this.exporting = false;
            },
        });
    }

    close(): void {
        if (!this.exporting) {
            this.dialogRef.close();
        }
    }
}
