import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import type { PPTFeature } from '@ppt';
import { BackendService } from '../../backend.service';

@Component({
    selector: 'app-feature-description',
    standalone: true,
    imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, NgFor, NgIf, SlicePipe],
    templateUrl: './feature-description.component.html',
    styleUrl: './feature-description.component.scss',
})
export class FeatureDescriptionComponent implements OnInit {
    description = '';
    features: PPTFeature[] = [];
    isLoadingFeatures = false;
    isSubmitting = false;
    featuresError = '';
    errorMessage = '';

    constructor(private readonly backend: BackendService) {}

    get openFeatures(): PPTFeature[] {
        return this.features.filter(feature =>
            feature.status === 'Questions' || feature.status === 'Wished' || feature.status === 'Backlog');
    }

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
        this.errorMessage = '';
        this.backend.addFeature(description).subscribe({
            next: feature => {
                this.features = [...this.features, feature];
                this.description = '';
                this.isSubmitting = false;
            },
            error: (error: Error) => {
                this.errorMessage = error.message;
                this.isSubmitting = false;
            },
        });
    }
}
