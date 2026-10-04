import { Component, OnInit } from '@angular/core';
import { DatePipe, NgFor, NgIf, SlicePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { BackendService, type GitLogEntry } from '../../backend.service';

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

    constructor(private backend: BackendService) {}

    ngOnInit(): void {
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
            error: (error: unknown) => {
                this.errorMessage = error instanceof Error ? error.message : 'Unable to load the Git log.';
                this.isLoading = false;
            },
        });
    }
}
