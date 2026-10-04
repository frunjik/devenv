import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { NgFor, NgIf, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { BackendService, type FeaturePriority, type FeatureStatus } from '../../backend.service';
import { FeatureWorkService } from '../../feature-work.service';

interface FeatureRow {
    id: string;
    description: string;
    priority: FeaturePriority;
    status: FeatureStatus;
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
        MatSortModule,
        MatTableModule,
        NgFor,
        NgIf,
        SlicePipe,
    ],
    templateUrl: './feature-description.component.html',
    styleUrl: './feature-description.component.scss',
})
export class FeatureDescriptionComponent implements AfterViewInit, OnInit {
    description = '';
    priority: FeaturePriority = 'Medium';
    status: FeatureStatus = 'Backlog';
    readonly priorities: FeaturePriority[] = ['High', 'Medium', 'Low'];
    readonly statuses: FeatureStatus[] = ['Backlog', 'In progress', 'Done'];
    featureSearch = '';
    isSubmitting = false;
    errorMessage = '';
    priorityError = '';
    statusError = '';
    completionError = '';
    readonly completingFeatureIds = new Set<string>();
    features: string[] = [];
    readonly featureDataSource = new MatTableDataSource<FeatureRow>([]);
    readonly displayedColumns = ['id', 'priority', 'status', 'description', 'actions'];
    isLoadingFeatures = false;
    featuresError = '';
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) set sort(sort: MatSort) {
        this.featureDataSource.sort = sort;
    }

    constructor(
        private backend: BackendService,
        readonly featureWork: FeatureWorkService,
    ) {
        this.featureDataSource.filterPredicate = (feature, filter) =>
            `${feature.id} ${feature.priority} ${feature.description}`.toLocaleLowerCase().includes(filter);
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
        if (!feature.id) {
            return;
        }
        this.statusError = '';
        this.backend.startFeature(feature.id).subscribe({
            next: () => {
                feature.status = 'In progress';
                this.featureWork.start(feature.id, feature.description);
                this.featureDataSource.data = [...this.featureDataSource.data];
            },
            error: (error: Error) => {
                this.statusError = error.message;
            },
        });
    }

    markFeatureDone(feature: FeatureRow): void {
        if (!feature.id || this.completingFeatureIds.has(feature.id)) {
            return;
        }

        this.completionError = '';
        this.completingFeatureIds.add(feature.id);
        this.backend.removeFeature(feature.id).subscribe({
            next: () => {
                this.featureWork.complete(feature.id);
                this.completingFeatureIds.delete(feature.id);
                this.refreshFeatures();
            },
            error: (error: Error) => {
                this.completionError = error.message;
                this.completingFeatureIds.delete(feature.id);
            },
        });
    }

    onPriorityChange(feature: FeatureRow, event: Event): void {
        const target = event.target;
        if (!(target instanceof HTMLSelectElement) || !this.priorities.includes(target.value as FeaturePriority)) {
            return;
        }

        const priority = target.value as FeaturePriority;
        if (feature.priority === priority) {
            return;
        }

        this.priorityError = '';
        this.backend.updateFeaturePriority(feature.id, priority).subscribe({
            next: () => {
                feature.priority = priority;
                this.featureDataSource.data = [...this.featureDataSource.data];
            },
            error: (error: Error) => {
                this.priorityError = error.message;
                target.value = feature.priority;
            },
        });
    }

    onStatusChange(feature: FeatureRow, event: Event): void {
        const target = event.target;
        if (!(target instanceof HTMLSelectElement) || !this.statuses.includes(target.value as FeatureStatus)) {
            return;
        }

        this.updateFeatureStatus(feature, target.value as FeatureStatus, target);
    }

    private updateFeatureStatus(
        feature: FeatureRow,
        status: FeatureStatus,
        target?: HTMLSelectElement,
    ): void {
        if (feature.status === status) {
            if (status === 'In progress') {
                this.featureWork.start(feature.id, feature.description);
            }
            return;
        }

        this.statusError = '';
        const update = status === 'In progress'
            ? this.backend.startFeature(feature.id)
            : this.backend.updateFeatureStatus(feature.id, status);
        update.subscribe({
            next: () => {
                feature.status = status;
                if (status === 'In progress') {
                    this.featureWork.start(feature.id, feature.description);
                } else {
                    this.featureWork.complete(feature.id);
                }
                this.featureDataSource.data = [...this.featureDataSource.data];
            },
            error: (error: Error) => {
                this.statusError = error.message;
                if (target) {
                    target.value = feature.status;
                }
            },
        });
    }

    private parseFeature(feature: string): FeatureRow {
        const match = feature.match(
            /^\/\/ (?:\[[^\]]+\] )?\[([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\] \[(High|Medium|Low)\] \[(Backlog|In progress|Done)\] (.+)$/i,
        );
        return match
            ? {
                id: match[1],
                priority: match[2] as FeaturePriority,
                status: match[3] as FeatureStatus,
                description: match[4],
            }
            : { id: '', priority: 'Medium', status: 'Backlog', description: feature.replace(/^\/\/ \[[^\]]+\] /, '') };
    }

    submit(): void {
        const description = this.description.trim();
        if (!description || this.isSubmitting) {
            return;
        }

        this.isSubmitting = true;
        this.errorMessage = '';
        this.backend.addFeature(description, this.priority, this.status).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.description = '';
                this.priority = 'Medium';
                this.status = 'Backlog';
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
