import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import type { WorkflowTodoList } from '@shared';
import { DatePipe, NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import clientPackage from '../../../package.json';
import { BackendService } from '../backend.service';
import { CurrentEntryService } from '../current-entry.service';
import { GitStatusService } from '../git-status.service';
import { RgrPhaseService } from '../rgr-phase.service';
import { TestRunCacheStatusService } from '../test-run-cache-status.service';
import { BusyIndicatorService } from '../busy-indicator.service';
import { SCHEDULER } from '../scheduler';

@Component({
    selector: 'app-status-toolbar',
    standalone: true,
    imports: [DatePipe, NgClass, MatButtonModule, MatToolbarModule, MatTooltipModule, MatProgressSpinnerModule, RouterLink],
    templateUrl: './status-toolbar.component.html',
    styleUrl: './status-toolbar.component.scss',
})
export class StatusToolbarComponent implements OnInit, OnDestroy {
    @Input({ required: true }) gitStatus!: GitStatusService;
    @Input({ required: true }) currentEntry!: CurrentEntryService;
    @Input({ required: true }) testRunCacheStatus!: TestRunCacheStatusService;
    @Input({ required: true }) rgrPhase!: RgrPhaseService;
    readonly busyIndicator = inject(BusyIndicatorService);
    private readonly scheduler = inject(SCHEDULER);
    readonly clientVersion = clientPackage.version;
    serverVersion = 'loading';
    versionError = '';
    activeWorkflow: WorkflowTodoList['activeWorkflow'] = null;
    workflowLoading = true;
    workflowError = '';
    private readonly subscriptions = new Subscription();
    private workflowRequest = new Subscription();

    constructor(private backend: BackendService) {}

    ngOnInit(): void {
        this.subscriptions.add(this.backend.getServerVersion().subscribe({
            next: version => {
                this.serverVersion = version;
            },
            error: (error: Error) => {
                this.serverVersion = 'unavailable';
                this.versionError = error.message;
            },
        }));
        this.refreshWorkflow();
        this.subscriptions.add(this.scheduler.every(30_000, () => this.refreshWorkflow()));
    }

    refreshWorkflow(): void {
        this.workflowRequest.unsubscribe();
        this.workflowLoading = true;
        this.workflowError = '';
        this.workflowRequest = this.backend.getWorkflowTodo().subscribe({
            next: list => {
                this.activeWorkflow = list.activeWorkflow;
                this.workflowLoading = false;
            },
            error: (error: Error) => {
                this.activeWorkflow = null;
                this.workflowError = error.message;
                this.workflowLoading = false;
            },
        });
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
        this.workflowRequest.unsubscribe();
    }
}
