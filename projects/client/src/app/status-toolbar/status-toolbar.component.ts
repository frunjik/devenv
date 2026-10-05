import { Component, inject, Input, OnInit } from '@angular/core';
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
import { TestRunCacheStatusService } from '../test-run-cache-status.service';
import { BusyIndicatorService } from '../busy-indicator.service';

@Component({
    selector: 'app-status-toolbar',
    standalone: true,
    imports: [DatePipe, NgClass, MatButtonModule, MatToolbarModule, MatTooltipModule, MatProgressSpinnerModule, RouterLink],
    templateUrl: './status-toolbar.component.html',
    styleUrl: './status-toolbar.component.scss',
})
export class StatusToolbarComponent implements OnInit {
    @Input({ required: true }) gitStatus!: GitStatusService;
    @Input({ required: true }) currentEntry!: CurrentEntryService;
    @Input({ required: true }) testRunCacheStatus!: TestRunCacheStatusService;
    readonly busyIndicator = inject(BusyIndicatorService);
    readonly clientVersion = clientPackage.version;
    serverVersion = 'loading';
    versionError = '';

    constructor(private backend: BackendService) {}

    ngOnInit(): void {
        this.backend.getServerVersion().subscribe({
            next: version => {
                this.serverVersion = version;
            },
            error: (error: Error) => {
                this.serverVersion = 'unavailable';
                this.versionError = error.message;
            },
        });
    }
}
