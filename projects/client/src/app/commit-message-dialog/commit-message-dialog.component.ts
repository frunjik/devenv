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
    templateUrl: './commit-message-dialog.component.html',
    styleUrl: './commit-message-dialog.component.scss',
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
