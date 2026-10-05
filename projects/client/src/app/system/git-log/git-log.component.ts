import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { DatePipe, NgFor, NgIf, SlicePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { BackendService, type GitLogEntry } from '../../backend.service';
import { GitLogRefreshService } from '../../git-log-refresh.service';

@Component({
    selector: 'app-git-log',
    standalone: true,
    imports: [DatePipe, MatButtonModule, NgFor, NgIf, SlicePipe],
    templateUrl: './git-log.component.html',
    styleUrl: './git-log.component.scss',
})
export class GitLogComponent implements OnInit {
    entries: GitLogEntry[] = [];
    isLoading = false;
    errorMessage = '';

    private destroyRef = inject(DestroyRef);

    constructor(
        private backend: BackendService,
        private gitLogRefresh: GitLogRefreshService,
    ) {}

    ngOnInit(): void {
        this.gitLogRefresh.refreshedEntries$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(entries => {
                this.entries = entries;
                this.errorMessage = '';
            });
        this.loadGitLog();
    }

    loadGitLog(): void {
        if (this.isLoading) {
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.backend.getGitLog().subscribe({
            next: entries => {
                this.entries = entries;
                this.isLoading = false;
            },
            error: (error: HttpErrorResponse) => {
                this.errorMessage = error.message;
                this.isLoading = false;
            },
        });
    }
}
