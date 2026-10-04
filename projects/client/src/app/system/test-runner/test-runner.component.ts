import { HttpErrorResponse } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { finalize } from 'rxjs';
import { BackendService, TestRunResult } from '../../backend.service';

@Component({
    selector: 'app-test-runner',
    standalone: true,
    imports: [NgIf],
    templateUrl: './test-runner.component.html',
    styleUrl: './test-runner.component.scss',
})
export class TestRunnerComponent {
    isRunning = false;
    result: TestRunResult | null = null;
    errorMessage = '';

    constructor(private backend: BackendService) {}

    runTests(): void {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;
        this.result = null;
        this.errorMessage = '';

        this.backend.runTests()
            .pipe(finalize(() => this.isRunning = false))
            .subscribe({
                next: result => this.result = result,
                error: error => this.errorMessage = this.getErrorMessage(error),
            });
    }

    private getErrorMessage(error: unknown): string {
        if (error instanceof HttpErrorResponse) {
            const payload: unknown = error.error;
            if (payload && typeof payload === 'object' && 'error' in payload) {
                const apiError = payload.error;
                if (apiError && typeof apiError === 'object' && 'message' in apiError
                    && typeof apiError.message === 'string') {
                    return apiError.message;
                }
            }
            return error.message;
        }

        return error instanceof Error ? error.message : 'Unknown error';
    }
}
