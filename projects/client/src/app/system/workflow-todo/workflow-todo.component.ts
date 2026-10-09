import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { validateWorkEvaluationDataset } from '@shared';
import type { WorkflowTodoList, WorkEvaluationDataset } from '@shared';
import { BackendService } from '../../backend.service';
import { formatElapsedDuration } from './evaluation-duration';

@Component({
    selector: 'app-workflow-todo',
    standalone: true,
    imports: [NgFor, NgIf, RouterLink],
    templateUrl: './workflow-todo.component.html',
    styleUrl: './workflow-todo.component.scss',
})
export class WorkflowTodoComponent implements OnInit, OnDestroy {
    workflows: WorkflowTodoList['workflows'] = [];
    activeWorkflow: WorkflowTodoList['activeWorkflow'] = null;
    get endUserWorkflows(): WorkflowTodoList['workflows'] {
        return this.workflows.filter(workflow => workflow.primaryWorkPurpose === 'Product work');
    }
    get metaWorkflows(): WorkflowTodoList['workflows'] {
        return this.workflows.filter(workflow => workflow.primaryWorkPurpose === 'Meta work');
    }
    get metricSummary(): { name: string; recorded: number; unknown: number }[] {
        if (!this.evaluationDataset) {
            return [];
        }
        const dataset = this.evaluationDataset;
        return dataset.metrics.map(metric => {
            const recorded = dataset.evaluations.filter(evaluation =>
                evaluation.measures.some(measure =>
                    measure.metricId === metric.id && measure.value !== null,
                ),
            ).length;
            return {
                name: metric.name,
                recorded,
                unknown: dataset.evaluations.length - recorded,
            };
        });
    }
    loading = true;
    errorMessage = '';
    evaluationDataset: WorkEvaluationDataset | null = null;
    evaluationLoading = false;
    evaluationError = '';
    private readonly subscriptions = new Subscription();

    constructor(private readonly backend: BackendService) {}

    completedEvaluationSummary(evaluationIds: string[]): string {
        if (this.evaluationDataset === null) {
            return '—';
        }
        const summaries = evaluationIds.flatMap(evaluationId => {
            const evaluation = this.evaluationDataset?.evaluations.find(item =>
                item.id === evaluationId && item.completedAt !== null,
            );
            return evaluation
                ? [`${evaluation.title} (${formatElapsedDuration(evaluation.startedAt, evaluation.completedAt)})`]
                : [];
        });
        return summaries.length ? summaries.join('; ') : '—';
    }

    ngOnInit(): void {
        this.subscriptions.add(this.backend.getWorkflowTodo().subscribe({
            next: list => {
                this.workflows = list.workflows;
                this.activeWorkflow = list.activeWorkflow;
                this.loading = false;
                if (list.workflows.some(workflow =>
                    workflow.resumePath.startsWith('./devenv-value-evaluation-workflow.md#'))) {
                    this.loadEvaluationDataset();
                }
            },
            error: (error: Error) => {
                this.errorMessage = error.message;
                this.loading = false;
            },
        }));
    }

    private loadEvaluationDataset(): void {
        this.evaluationLoading = true;
        this.subscriptions.add(this.backend.loadFile(
            'knowledge\\workflows\\devenv-value-evaluation.json',
        ).subscribe({
            next: text => {
                try {
                    const value: unknown = JSON.parse(text);
                    const dataset = validateWorkEvaluationDataset(value);
                    const knownEvaluationIds = new Set(dataset.evaluations.map(evaluation => evaluation.id));
                    const unknownEvaluationIds = this.workflows
                        .flatMap(workflow => workflow.evaluationIds)
                        .filter(evaluationId => !knownEvaluationIds.has(evaluationId));
                    if (unknownEvaluationIds.length) {
                        throw new Error(`Workflow TODO data references unknown evaluation IDs: ${
                            [...new Set(unknownEvaluationIds)].join(', ')
                        }`);
                    }
                    this.evaluationDataset = dataset;
                    this.evaluationLoading = false;
                } catch (error) {
                    this.evaluationError = String(error);
                    this.evaluationLoading = false;
                }
            },
            error: (error: Error) => {
                this.evaluationError = error.message;
                this.evaluationLoading = false;
            },
        }));
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}
