import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgFor, NgIf, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { BackendService, type FeaturePriority, type FeatureStatus } from '../../backend.service';
import { CurrentTaskService } from '../../current-task.service';
import { FeatureWorkService } from '../../feature-work.service';
import { EditFeatureDialogComponent } from './edit-feature-dialog.component';

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
        MatDialogModule,
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
export class FeatureDescriptionComponent implements AfterViewInit, OnDestroy, OnInit {
    description = '';
    priority: FeaturePriority = 'Low';
    status: FeatureStatus = 'Backlog';
    readonly priorities: FeaturePriority[] = ['High', 'Medium', 'Low'];
    readonly statuses: FeatureStatus[] = ['Backlog', 'In progress', 'Done'];
    featureSearch = '';
    isSubmitting = false;
    errorMessage = '';
    priorityError = '';
    statusError = '';
    completionError = '';
    editError = '';
    readonly completingFeatureIds = new Set<string>();
    features: string[] = [];
    doneFeatures: FeatureRow[] = [];
    readonly featureDataSource = new MatTableDataSource<FeatureRow>([]);
    readonly displayedColumns = ['id', 'priority', 'status', 'description', 'actions'];
    isLoadingFeatures = false;
    private featureRefreshSubscription = Subscription.EMPTY;
    featuresError = '';
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) set sort(sort: MatSort) {
        this.featureDataSource.sort = sort;
    }

    get inProgressFeatures(): FeatureRow[] {
        return this.featureDataSource.data.filter(feature => feature.status === 'In progress');
    }

    get matchingDoneFeatures(): FeatureRow[] {
        const filter = this.featureSearch.trim().toLocaleLowerCase();
        return filter ? this.doneFeatures.filter(feature => this.matchesFeature(feature, filter)) : this.doneFeatures;
    }

    constructor(
        private backend: BackendService,
        readonly featureWork: FeatureWorkService,
        private currentTask: CurrentTaskService,
        private dialog: MatDialog,
    ) {
        this.featureDataSource.filterPredicate = (feature, filter) => this.matchesFeature(feature, filter);
    }

    ngOnInit(): void {
        this.refreshFeatures();
    }

    ngAfterViewInit(): void {
        this.featureDataSource.paginator = this.paginator;
    }

    ngOnDestroy(): void {
        this.featureRefreshSubscription.unsubscribe();
    }

    refreshFeatures(): void {
        this.featureRefreshSubscription.unsubscribe();
        this.isLoadingFeatures = true;
        this.featuresError = '';
        this.featureRefreshSubscription = this.backend.getFeatures().subscribe({
            next: features => {
                this.features = features;
                this.refreshFeatureLists();
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
            next: entry => {
                this.updateFeatureEntry(entry);
                this.featureWork.start(feature.id, feature.description);
                this.currentTask.refresh();
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
        this.backend.updateFeatureStatus(feature.id, 'Done').subscribe({
            next: entry => {
                this.featureWork.complete(feature.id);
                this.completingFeatureIds.delete(feature.id);
                this.currentTask.refresh();
                this.updateFeatureEntry(entry);
            },
            error: (error: Error) => {
                this.completionError = error.message;
                this.completingFeatureIds.delete(feature.id);
            },
        });
    }

    editFeature(feature: FeatureRow): void {
        const featureId = feature.id;

        this.dialog.open(EditFeatureDialogComponent, {
            width: 'min(48rem, calc(100vw - 2rem))',
            ariaLabel: 'Edit feature',
            data: { description: feature.description },
        }).afterClosed().subscribe(description => {
            if (typeof description !== 'string' || !description.trim()
                || description.trim() === feature.description) {
                return;
            }

            this.editError = '';
            this.backend.updateFeatureDescription(featureId, description).subscribe({
                next: entry => {
                    const updatedFeature = this.parseFeature(entry);
                    if (this.featureWork.activeFeature?.id === featureId) {
                        this.featureWork.start(featureId, updatedFeature.description);
                    }
                    if (feature.status === 'In progress') {
                        this.currentTask.refresh();
                    }
                    this.updateFeatureEntry(entry);
                },
                error: (error: Error) => {
                    this.editError = error.message;
                },
            });
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
            next: entry => {
                this.updateFeatureEntry(entry);
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
            next: entry => {
                if (status === 'In progress') {
                    this.featureWork.start(feature.id, this.parseFeature(entry).description);
                    this.currentTask.refresh();
                } else {
                    this.featureWork.complete(feature.id);
                    this.currentTask.refresh();
                }
                this.updateFeatureEntry(entry);
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

    private updateFeatureEntry(entry: string): void {
        const updatedFeature = this.parseFeature(entry);
        this.features = this.features.map(feature =>
            this.parseFeature(feature).id === updatedFeature.id ? entry : feature,
        );
        this.refreshFeatureLists();
    }

    private refreshFeatureLists(): void {
        const features = this.features.map(feature => this.parseFeature(feature));
        this.doneFeatures = features.filter(feature => feature.status === 'Done');
        this.featureDataSource.data = features.filter(feature => feature.status !== 'Done');
        this.featureDataSource.filter = this.featureSearch.trim().toLocaleLowerCase();
    }

    private matchesFeature(feature: FeatureRow, filter: string): boolean {
        return `${feature.id} ${feature.priority} ${feature.description}`.toLocaleLowerCase().includes(filter);
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
                this.priority = 'Low';
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
