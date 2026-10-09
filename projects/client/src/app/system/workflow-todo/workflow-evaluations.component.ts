import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { validateWorkEvaluationDataset } from '@shared';
import type { WorkEvaluationDataset } from '@shared';
import { BackendService } from '../../backend.service';

@Component({
    selector: 'app-workflow-evaluations',
    standalone: true,
    imports: [NgFor, NgIf],
    templateUrl: './workflow-evaluations.component.html',
    styleUrl: './workflow-evaluations.component.scss',
})
export class WorkflowEvaluationsComponent implements OnInit {
    dataset: WorkEvaluationDataset | null = null;
    loading = true;
    errorMessage = '';

    constructor(private readonly backend: BackendService) {}

    formatElapsedDuration(startedAt: string | null, completedAt: string | null): string {
        if (startedAt === null || completedAt === null) {
            return 'Unknown';
        }

        const start = Date.parse(startedAt);
        const completion = Date.parse(completedAt);
        if (!Number.isFinite(start) || !Number.isFinite(completion)) {
            return 'Unavailable (invalid timestamp)';
        }

        const elapsedSeconds = Math.floor((completion - start) / 1000);
        if (elapsedSeconds < 0) {
            return 'Unavailable (completion precedes start)';
        }

        const hours = Math.floor(elapsedSeconds / 3600);
        const minutes = Math.floor((elapsedSeconds % 3600) / 60);
        const seconds = elapsedSeconds % 60;
        return hours > 0
            ? `${hours}h ${minutes}m ${seconds}s`
            : `${Math.floor(elapsedSeconds / 60)}m ${seconds}s`;
    }

    ngOnInit(): void {
        this.backend.loadFile('knowledge\\workflows\\devenv-value-evaluation.json').subscribe({
            next: text => {
                try {
                    const value: unknown = JSON.parse(text);
                    this.dataset = validateWorkEvaluationDataset(value);
                    this.loading = false;
                } catch (error) {
                    this.errorMessage = String(error);
                    this.loading = false;
                }
            },
            error: (error: Error) => {
                this.errorMessage = error.message;
                this.loading = false;
            },
        });
    }
}
