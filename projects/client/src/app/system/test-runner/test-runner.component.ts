import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subscription } from 'rxjs';
import type { TestOutputStream } from '@shared';
import { BackendService, type LastTestRun } from '../../backend.service';
import { TestRunnerService } from '../../test-runner.service';
import { TestRunCacheStatusService } from '../../test-run-cache-status.service';

type TestRunResult = Pick<LastTestRun, 'exitCode' | 'stdout' | 'stderr'>;

@Component({
    selector: 'app-test-runner',
    standalone: true,
    imports: [DatePipe, NgIf, MatProgressBarModule],
    templateUrl: './test-runner.component.html',
    styleUrl: './test-runner.component.scss',
})
export class TestRunnerComponent implements OnDestroy, OnInit {
    isRunning = false;
    result: TestRunResult | null = null;
    errorMessage = '';
    lastTestRun: LastTestRun | null = null;
    lastTestRunError = '';
    isLoadingLastTestRun = false;
    private lastTestRunSubscription = Subscription.EMPTY;
    constructor(
        private backend: BackendService,
        private readonly testRunner: TestRunnerService,
        readonly cacheStatus: TestRunCacheStatusService,
    ) {}

    ngOnInit(): void {
        this.cacheStatus.refresh();
        this.refreshLastTestRun();
        this.runTests();
    }

    ngOnDestroy(): void {
        this.lastTestRunSubscription.unsubscribe();
    }

    refreshCacheStatus(): void {
        this.cacheStatus.refresh();
    }

    runTests(): void {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;
        this.result = null;
        this.errorMessage = '';

        this.result = { exitCode: null, stdout: '', stderr: '' };
        void this.testRunner.runTests((stream, chunk) => this.appendOutput(stream, chunk))
            .then(exitCode => {
                if (this.result) {
                    this.result.exitCode = exitCode;
                }
            })
            .catch(error => this.errorMessage = this.getErrorMessage(error))
            .finally(() => {
                this.isRunning = false;
                this.refreshCacheStatus();
                this.refreshLastTestRun();
            });
    }

    private refreshLastTestRun(): void {
        this.lastTestRunSubscription.unsubscribe();
        this.isLoadingLastTestRun = true;
        this.lastTestRunError = '';
        this.lastTestRunSubscription = this.backend.getLastTestRun().subscribe({
            next: lastTestRun => {
                this.lastTestRun = lastTestRun;
                this.isLoadingLastTestRun = false;
            },
            error: (error: Error) => {
                this.lastTestRunError = error.message;
                this.isLoadingLastTestRun = false;
            },
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
