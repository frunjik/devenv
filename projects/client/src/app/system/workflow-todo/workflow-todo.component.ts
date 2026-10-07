import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import type { WorkflowTodoList } from '@shared';
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
    documentLoading = false;
    documentError = '';
    documentText = '';
    documentReference = '';
    private readonly subscriptions = new Subscription();
    private documentSubscription = new Subscription();

    constructor(private readonly backend: BackendService) {}

    ngOnInit(): void {
        this.subscriptions.add(this.backend.getWorkflowTodo().subscribe({
            next: list => {
                this.workflows = list.workflows;
                this.loading = false;
            },
            error: (error: Error) => {
                this.errorMessage = error.message;
                this.loading = false;
            },
        }));
    }

    openDocument(resumePath: string): void {
        this.documentSubscription.unsubscribe();
        this.documentReference = resumePath;
        this.documentText = '';
        this.documentError = '';
        this.documentLoading = true;
        const filename = resumePath.split('#')[0].slice(2);
        this.documentSubscription = this.backend.loadFile(`design\\${filename}`).subscribe({
            next: text => {
                this.documentText = text;
                this.documentLoading = false;
            },
            error: (error: Error) => {
                this.documentError = error.message;
                this.documentLoading = false;
            },
        });
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
        this.documentSubscription.unsubscribe();
    }
}
