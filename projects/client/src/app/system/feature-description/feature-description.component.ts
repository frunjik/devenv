import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BackendService } from '../../backend.service';

@Component({
    selector: 'app-feature-description',
    standalone: true,
    imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, NgIf],
    templateUrl: './feature-description.component.html',
    styleUrl: './feature-description.component.scss',
})
export class FeatureDescriptionComponent {
    description = '';
    isSubmitting = false;
    successMessage = '';
    errorMessage = '';

    constructor(private backend: BackendService) {}

    submit(): void {
        const description = this.description.trim();
        if (!description || this.isSubmitting) {
            return;
        }

        this.isSubmitting = true;
        this.successMessage = '';
        this.errorMessage = '';
        this.backend.addFeature(description).subscribe({
            next: () => {
                this.successMessage = 'Feature added.';
                this.isSubmitting = false;
            },
            error: (error: Error) => {
                this.errorMessage = error.message;
                this.isSubmitting = false;
            },
        });
    }
}
