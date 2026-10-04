import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { NgIf, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { BackendService } from '../../backend.service';
import { FeatureWorkService } from '../../feature-work.service';

interface FeatureRow {
    id: string;
    description: string;
}

@Component({
    selector: 'app-feature-description',
    standalone: true,
    imports: [
        FormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatPaginatorModule,
        MatTableModule,
        NgIf,
        SlicePipe,
    ],
    templateUrl: './feature-description.component.html',
    styleUrl: './feature-description.component.scss',
})
export class FeatureDescriptionComponent implements AfterViewInit, OnInit {
    description = '';
    featureSearch = '';
    isSubmitting = false;
    errorMessage = '';
    features: string[] = [];
    readonly featureDataSource = new MatTableDataSource<FeatureRow>([]);
    readonly displayedColumns = ['id', 'description', 'actions'];
    isLoadingFeatures = false;
    featuresError = '';
    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(
        private backend: BackendService,
        readonly featureWork: FeatureWorkService,
    ) {
        this.featureDataSource.filterPredicate = (feature, filter) =>
            `${feature.id} ${feature.description}`.toLocaleLowerCase().includes(filter);
    }

    ngOnInit(): void {
        this.refreshFeatures();
    }

    ngAfterViewInit(): void {
        this.featureDataSource.paginator = this.paginator;
    }

    refreshFeatures(): void {
        this.isLoadingFeatures = true;
        this.featuresError = '';
        this.backend.getFeatures().subscribe({
            next: features => {
                this.features = features;
                this.featureDataSource.data = features.map(feature => this.parseFeature(feature));
                this.isLoadingFeatures = false;
            },
            error: (error: Error) => {
                this.featuresError = error.message;
                this.isLoadingFeatures = false;
            },
        });
    }

    searchFeatures(search: string): void {
        this.featureSearch = search;
        this.featureDataSource.filter = search.trim().toLocaleLowerCase();
        this.paginator?.firstPage();
    }

    onSearchInput(event: Event): void {
        const target = event.target;
        if (target instanceof HTMLInputElement) {
            this.searchFeatures(target.value);
        }
    }

    startFeature(feature: FeatureRow): void {
        this.featureWork.start(feature.id, feature.description);
    }

    private parseFeature(feature: string): FeatureRow {
        const match = feature.match(
            /^\/\/ \[[^\]]+\] \[([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\] (.+)$/i,
        );
        return match
            ? { id: match[1], description: match[2] }
            : { id: '', description: feature.replace(/^\/\/ \[[^\]]+\] /, '') };
    }

    submit(): void {
        const description = this.description.trim();
        if (!description || this.isSubmitting) {
            return;
        }

        this.isSubmitting = true;
        this.errorMessage = '';
        this.backend.addFeature(description).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.description = '';
                this.refreshFeatures();
            },
            error: (error: Error) => {
                this.errorMessage = error.message;
                this.isSubmitting = false;
            },
        });
    }

    onDescriptionKeydown(event: KeyboardEvent): void {
        if (event.ctrlKey && (event.key.toLowerCase() === 's' || event.key === 'Enter')) {
            event.preventDefault();
            const target = event.currentTarget;
            if (target instanceof HTMLTextAreaElement && target.form) {
                target.form.requestSubmit();
            }
        }
    }
}
