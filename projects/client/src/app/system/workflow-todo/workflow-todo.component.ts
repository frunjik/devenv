import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import { validateWorkEvaluationDataset } from '@shared';
import type { WorkflowTodoList, WorkEvaluationDataset } from '@shared';
import { BackendService } from '../../backend.service';

@Component({
    selector: 'app-workflow-todo',
    standalone: true,
    imports: [NgFor, NgIf],
    templateUrl: './workflow-todo.component.html',
    styleUrl: './workflow-todo.component.scss',
})
export class WorkflowTodoComponent implements OnInit, OnDestroy {
    workflows: WorkflowTodoList['workflows'] = [];
    loading = true;
    errorMessage = '';
    evaluationDataset: WorkEvaluationDataset | null = null;
    evaluationLoading = false;
    evaluationError = '';
    private readonly subscriptions = new Subscription();

    constructor(private readonly backend: BackendService) {}

    ngOnInit(): void {
        this.subscriptions.add(this.backend.getWorkflowTodo().subscribe({
            next: list => {
                this.workflows = list.workflows;
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
                    this.evaluationDataset = validateWorkEvaluationDataset(value);
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
