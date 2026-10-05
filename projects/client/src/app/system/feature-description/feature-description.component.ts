import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgFor, NgIf, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Subscription, forkJoin } from 'rxjs';
import type { PPTFeature } from '@ppt';
import { BackendService, type FeaturePriority, type PPTFeatureStatus } from '../../backend.service';
import { CurrentTaskService } from '../../current-task.service';
import { FeatureWorkService } from '../../feature-work.service';
import { EditFeatureDialogComponent } from './edit-feature-dialog.component';

type FeatureListTab = 'open' | 'queued' | 'done';

@Component({
    selector: 'app-feature-description',
    standalone: true,
    imports: [
        FormsModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
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
    status: PPTFeatureStatus = 'Wished';
    readonly priorities: FeaturePriority[] = ['High', 'Medium', 'Low'];
    readonly statuses: PPTFeatureStatus[] = [
        'Questions',
        'Wished',
        'Backlog',
        'Queued',
        'InProgress',
        'Committed',
        'Done',
        'Aborted',
        'Denied',
    ];
    featureSearch = '';
    isSubmitting = false;
    errorMessage = '';
    priorityError = '';
    statusError = '';
    abortError = '';
    completionError = '';
    featureOrderError = '';
    editError = '';
    isReorderingFeatures = false;
    readonly completingFeatureIds = new Set<string>();
    readonly abortingFeatureIds = new Set<string>();
    features: PPTFeature[] = [];
    archivedFeatures: PPTFeature[] = [];
    doneFeatures: PPTFeature[] = [];
    readonly featureDataSource = new MatTableDataSource<PPTFeature>([]);
    readonly displayedColumns = ['id', 'priority', 'status', 'description', 'actions'];
    selectedFeatureTab: FeatureListTab = 'queued';
    isLoadingFeatures = false;
    private featureRefreshSubscription = Subscription.EMPTY;
    featuresError = '';
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) set sort(sort: MatSort) {
        this.featureDataSource.sort = sort;
    }

    get queuedFeatures(): PPTFeature[] {
        return this.featureDataSource.data.filter(feature => feature.status === 'Queued');
    }

    get matchingQueuedFeatures(): PPTFeature[] {
        const filter = this.featureSearch.trim().toLocaleLowerCase();
        return filter
            ? this.queuedFeatures.filter(feature => this.matchesFeature(feature, filter))
            : this.queuedFeatures;
    }

    get matchingDoneFeatures(): PPTFeature[] {
        const filter = this.featureSearch.trim().toLocaleLowerCase();
        return filter ? this.doneFeatures.filter(feature => this.matchesFeature(feature, filter)) : this.doneFeatures;
    }

    selectFeatureTab(tab: FeatureListTab): void {
        this.selectedFeatureTab = tab;
    }

    onFeatureTabKeydown(event: KeyboardEvent, tab: FeatureListTab): void {
        const direction = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
        if (direction === 0) {
            return;
        }

        event.preventDefault();
        const tabs: FeatureListTab[] = ['open', 'queued', 'done'];
        const currentIndex = tabs.indexOf(tab);
        const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
        this.selectedFeatureTab = tabs[nextIndex];
        const target = event.currentTarget;
        if (target instanceof HTMLButtonElement) {
            target.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[nextIndex]?.focus();
        }
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
        this.featureRefreshSubscription = forkJoin([this.backend.getFeatures(), this.backend.getArchived()]).subscribe({
            next: ([features, archivedFeatures]) => {
                this.features = features;
                this.archivedFeatures = archivedFeatures;
                this.refreshFeatureLists();
                this.isLoadingFeatures = false;
            },
            error: (error: Error) => {
                this.featuresError = error.message;
                this.isLoadingFeatures = false;
            },
        });
    }

    abortFeature(feature: PPTFeature): void {
        if (this.abortingFeatureIds.has(feature.id)) {
            return;
        }

        this.abortError = '';
        this.abortingFeatureIds.add(feature.id);
        this.backend.updateFeatureStatus(feature.id, 'Aborted').subscribe({
            next: entry => {
                this.featureWork.complete(feature.id);
                this.abortingFeatureIds.delete(feature.id);
                this.currentTask.refresh();
                this.updateFeatureEntry(entry);
            },
            error: (error: Error) => {
                this.abortError = error.message;
                this.abortingFeatureIds.delete(feature.id);
            },
        });
    }

    moveQueuedFeature(feature: PPTFeature, direction: 'up' | 'down'): void {
        const features = this.queuedFeatures;
        const position = features.findIndex(item => item.id === feature.id);
        const targetPosition = position + (direction === 'up' ? -1 : 1);
        if (this.isReorderingFeatures || position < 0
            || targetPosition < 0 || targetPosition >= features.length) {
            return;
        }

        this.featureOrderError = '';
        this.isReorderingFeatures = true;
        this.backend.moveQueuedFeature(feature.id, direction).subscribe({
            next: entries => {
                this.features = entries;
                this.refreshFeatureLists();
                this.isReorderingFeatures = false;
            },
            error: (error: Error) => {
                this.featureOrderError = error.message;
                this.isReorderingFeatures = false;
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

    startFeature(feature: PPTFeature): void {
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

    markFeatureDone(feature: PPTFeature): void {
        if (this.completingFeatureIds.has(feature.id)) {
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

    denyFeature(feature: PPTFeature): void {
        this.updateFeatureStatus(feature, 'Denied');
    }

    editFeature(feature: PPTFeature): void {
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

                    if (this.featureWork.activeFeature?.id === featureId) {
                        this.featureWork.start(featureId, entry.description);
                    }
                    if (feature.status === 'Queued') {
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

    onPriorityChange(feature: PPTFeature, event: Event): void {
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

    onStatusChange(feature: PPTFeature, event: Event): void {
        const target = event.target;
        if (!(target instanceof HTMLSelectElement) || !this.statuses.includes(target.value as PPTFeatureStatus)) {
            return;
        }

        this.updateFeatureStatus(feature, target.value as PPTFeatureStatus, target);
    }

    private updateFeatureStatus(
        feature: PPTFeature,
        status: PPTFeatureStatus,
        target?: HTMLSelectElement,
    ): void {
        if (feature.status === status) {
            if (status === 'Queued') {
                this.featureWork.start(feature.id, feature.description);
            }
            return;
        }

        this.statusError = '';
        const update = status === 'Queued'
            ? this.backend.startFeature(feature.id)
            : this.backend.updateFeatureStatus(feature.id, status);
        update.subscribe({
            next: entry => {
                if (status === 'Queued') {
                    this.featureWork.start(feature.id, entry.description);
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

    private updateFeatureEntry(updatedFeature: PPTFeature): void {
        this.features = this.features.map(feature => feature.id === updatedFeature.id ? updatedFeature : feature);
        this.refreshFeatureLists();
    }

    private refreshFeatureLists(): void {
        const features = this.features;
        this.doneFeatures = [...features.filter(feature => feature.status === 'Done'), ...this.archivedFeatures];
        this.featureDataSource.data = features.filter(feature => feature.status !== 'Done');
        this.featureDataSource.filter = this.featureSearch.trim().toLocaleLowerCase();
    }

    private matchesFeature(feature: PPTFeature, filter: string): boolean {
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
                this.status = 'Wished';
                this.selectedFeatureTab = 'open';
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
