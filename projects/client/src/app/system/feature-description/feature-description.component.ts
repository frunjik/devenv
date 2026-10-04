import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BackendService } from '../../backend.service';

@Component({
    selector: 'app-feature-description',
    standalone: true,
    imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, NgFor, NgIf],
    templateUrl: './feature-description.component.html',
    styleUrl: './feature-description.component.scss',
})
export class FeatureDescriptionComponent implements OnInit {
    description = '';
    isSubmitting = false;
    successMessage = '';
    errorMessage = '';
    features: string[] = [];
    isLoadingFeatures = false;
    featuresError = '';

    constructor(private backend: BackendService) {}

    ngOnInit(): void {
        this.refreshFeatures();
    }

    refreshFeatures(): void {
        this.isLoadingFeatures = true;
        this.featuresError = '';
        this.backend.getFeatures().subscribe({
            next: features => {
                this.features = features;
                this.isLoadingFeatures = false;
            },
            error: (error: Error) => {
                this.featuresError = error.message;
                this.isLoadingFeatures = false;
            },
        });
    }

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
                this.refreshFeatures();
            },
            error: (error: Error) => {
                this.errorMessage = error.message;
                this.isSubmitting = false;
            },
        });
    }
}
