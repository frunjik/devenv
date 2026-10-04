import { Component, Inject, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'app-commit-message-dialog',
    standalone: true,
    imports: [FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule],
    template: `
        <h2 mat-dialog-title>Commit changes</h2>
        <mat-dialog-content>
            <mat-form-field appearance="outline">
                <mat-label>Commit message</mat-label>
                <textarea
                    matInput
                    [(ngModel)]="message"
                    rows="8"
                    maxlength="5000"
                    aria-label="Commit message"
                    (keydown)="onMessageKeydown($event)"
                ></textarea>
            </mat-form-field>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button type="button" mat-button mat-dialog-close>Cancel</button>
            <button type="button" mat-flat-button color="primary" [disabled]="!message.trim()" (click)="submit()">
                Commit
            </button>
        </mat-dialog-actions>
    `,
    styles: [`
        mat-form-field {
            width: 100%;
        }

        mat-dialog-content {
            padding-top: 0.5rem;
        }
    `],
})
export class CommitMessageDialogComponent {
    message = '';
    private dialogRef = inject(MatDialogRef<CommitMessageDialogComponent, string>);

    constructor(
        @Inject(MAT_DIALOG_DATA) data: { message: string },
    ) {
        this.message = data.message;
    }

    submit(): void {
        const message = this.message.trim();
        if (message) {
            this.dialogRef.close(message);
        }
    }

    onMessageKeydown(event: KeyboardEvent): void {
        if (event.ctrlKey && event.key === 'Enter') {
            event.preventDefault();
            this.submit();
        }
    }
}
