import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { validateWorkEvaluationDataset } from '@shared';
import type { WorkEvaluationDataset } from '@shared';
import { BackendService } from '../../backend.service';
import { formatElapsedDuration } from './evaluation-duration';

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
        return formatElapsedDuration(startedAt, completedAt);
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
