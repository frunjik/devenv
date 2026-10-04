import { Component, Inject, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'app-edit-feature-dialog',
    standalone: true,
    imports: [FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule],
    template: `
        <h2 mat-dialog-title>Edit feature</h2>
        <mat-dialog-content>
            <mat-form-field appearance="outline">
                <mat-label>Feature description</mat-label>
                <textarea
                    matInput
                    [(ngModel)]="description"
                    rows="8"
                    maxlength="5000"
                    aria-label="Feature description"
                    (keydown)="onDescriptionKeydown($event)"
                ></textarea>
            </mat-form-field>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button type="button" mat-button mat-dialog-close>Cancel</button>
            <button
                type="button"
                mat-flat-button
                color="primary"
                [disabled]="!description.trim()"
                (click)="submit()"
            >
                Save
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
export class EditFeatureDialogComponent {
    description = '';
    private readonly dialogRef = inject(MatDialogRef<EditFeatureDialogComponent, string>);

    constructor(@Inject(MAT_DIALOG_DATA) data: { description: string }) {
        this.description = data.description;
    }

    submit(): void {
        const description = this.description.trim();
        if (description) {
            this.dialogRef.close(description);
        }
    }

    onDescriptionKeydown(event: KeyboardEvent): void {
        if (event.ctrlKey && event.key === 'Enter') {
            event.preventDefault();
            this.submit();
        }
    }
}
