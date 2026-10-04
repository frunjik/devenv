import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
    BackendService,
    type TestOutputStream,
    type TestRunCacheStatus,
} from '../../backend.service';

interface TestRunResult {
    exitCode: number | null;
    stdout: string;
    stderr: string;
}

@Component({
    selector: 'app-test-runner',
    standalone: true,
    imports: [DatePipe, NgIf, MatProgressBarModule],
    templateUrl: './test-runner.component.html',
    styleUrl: './test-runner.component.scss',
})
export class TestRunnerComponent implements OnInit {
    isRunning = false;
    result: TestRunResult | null = null;
    errorMessage = '';
    cacheStatus: TestRunCacheStatus | null = null;
    isLoadingCacheStatus = false;
    cacheStatusError = '';

    constructor(private backend: BackendService) {}

    ngOnInit(): void {
        this.refreshCacheStatus();
        this.runTests();
    }

    refreshCacheStatus(): void {
        this.isLoadingCacheStatus = true;
        this.cacheStatusError = '';
        this.backend.getTestRunCacheStatus().subscribe({
            next: status => {
                this.cacheStatus = status;
                this.isLoadingCacheStatus = false;
            },
            error: (error: Error) => {
                this.cacheStatusError = error.message;
                this.isLoadingCacheStatus = false;
            },
        });
    }

    runTests(): void {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;
        this.result = null;
        this.errorMessage = '';

        this.result = { exitCode: null, stdout: '', stderr: '' };
        void this.backend.runTests((stream, chunk) => this.appendOutput(stream, chunk))
            .then(exitCode => {
                if (this.result) {
                    this.result.exitCode = exitCode;
                }
            })
            .catch(error => this.errorMessage = this.getErrorMessage(error))
            .finally(() => {
                this.isRunning = false;
                this.refreshCacheStatus();
            });
    }

    private appendOutput(stream: TestOutputStream, chunk: string): void {
        if (this.result) {
            this.result[stream] += chunk;
        }
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
