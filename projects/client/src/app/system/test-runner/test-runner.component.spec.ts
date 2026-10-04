import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { BackendService, type TestRunCacheStatus } from '../../backend.service';
import { TestRunnerComponent } from './test-runner.component';

describe('TestRunnerComponent', () => {
    let fixture: ComponentFixture<TestRunnerComponent>;
    let component: TestRunnerComponent;
    let runTests: jest.MockedFunction<BackendService['runTests']>;
    let getCacheStatus: jest.MockedFunction<BackendService['getTestRunCacheStatus']>;

    beforeEach(async () => {
        runTests = jest.fn<BackendService['runTests']>();
        runTests.mockResolvedValue(0);
        getCacheStatus = jest.fn<BackendService['getTestRunCacheStatus']>();
        getCacheStatus.mockReturnValue(of({
            available: false,
            status: 'empty',
            startedAt: null,
            finishedAt: null,
            exitCode: null,
        }));
        await TestBed.configureTestingModule({
            imports: [TestRunnerComponent],
            providers: [{ provide: BackendService, useValue: { runTests, getTestRunCacheStatus: getCacheStatus } }],
        }).compileComponents();

        fixture = TestBed.createComponent(TestRunnerComponent);
        component = fixture.componentInstance;
    });

    it('automatically runs the test suites when the page opens', () => {
        fixture.detectChanges();

        expect(runTests).toHaveBeenCalledTimes(1);
        expect(getCacheStatus).toHaveBeenCalledTimes(1);
        expect(fixture.nativeElement.querySelector('button')).not.toBeNull();
    });

    it('shows that there is no cached result', () => {
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('No cached test runs.');
    });

    it('shows the status and finished time of the cached result', () => {
        const status: TestRunCacheStatus = {
            available: true,
            status: 'passed',
            startedAt: '2026-10-04T12:00:00.000Z',
            finishedAt: '2026-10-04T12:01:00.000Z',
            exitCode: 0,
        };
        getCacheStatus.mockReturnValue(of(status));

        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Status: passed');
        expect(fixture.nativeElement.textContent).toContain('exit code 0');
        expect(fixture.nativeElement.querySelector('time').getAttribute('datetime'))
            .toBe(status.finishedAt);
    });

    it('refreshes the displayed cache status after a test run finishes', async () => {
        const passedStatus: TestRunCacheStatus = {
            available: true,
            status: 'passed',
            startedAt: '2026-10-04T12:00:00.000Z',
            finishedAt: '2026-10-04T12:01:00.000Z',
            exitCode: 0,
        };
        getCacheStatus
            .mockReturnValueOnce(of({
                available: false,
                status: 'empty',
                startedAt: null,
                finishedAt: null,
                exitCode: null,
            }))
            .mockReturnValueOnce(of(passedStatus));
        runTests.mockResolvedValue(0);

        fixture.detectChanges();
        await Promise.resolve();
        await Promise.resolve();
        fixture.detectChanges();

        expect(getCacheStatus).toHaveBeenCalledTimes(2);
        expect(fixture.nativeElement.textContent).toContain('Status: passed');
    });

    it('shows an error when the cached status cannot be loaded', () => {
        getCacheStatus.mockReturnValue(throwError(() => new Error('Cache unavailable')));

        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain(
            'Could not load cached test status: Cache unavailable',
        );
    });

    it('shows an indeterminate progress bar while the tests are running', () => {
        runTests.mockImplementation(() => new Promise(() => undefined));

        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('mat-progress-bar')).not.toBeNull();
    });

    it('hides the progress bar when the tests finish', async () => {
        runTests.mockResolvedValue(0);

        fixture.detectChanges();
        await Promise.resolve();
        await Promise.resolve();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('mat-progress-bar')).toBeNull();
    });

    it('shows output as it streams and reports a successful exit', async () => {
        runTests.mockImplementation(async onOutput => {
            onOutput('stdout', 'Client and server tests passed');
            onOutput('stderr', 'warning');
            return 0;
        });

        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Client and server tests passed');
        expect(fixture.nativeElement.textContent).toContain('Test output (running)');

        await Promise.resolve();
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Tests passed (exit code 0)');
        expect(fixture.nativeElement.textContent).not.toContain('Standard error');
        expect(fixture.nativeElement.textContent).not.toContain('warning');
    });

    it('shows standard error when tests fail', async () => {
        runTests.mockImplementation(async onOutput => {
            onOutput('stderr', 'test failure details');
            return 1;
        });

        fixture.detectChanges();
        await Promise.resolve();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Tests failed (exit code 1)');
        expect(fixture.nativeElement.textContent).toContain('Standard error');
        expect(fixture.nativeElement.textContent).toContain('test failure details');
    });

    it('shows an API error when the request fails', async () => {
        runTests.mockRejectedValue(new Error('Server unavailable'));

        fixture.detectChanges();
        await Promise.resolve();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Could not run tests: Server unavailable');
    });

    it('shows the message returned by the API', async () => {
        runTests.mockRejectedValue(new HttpErrorResponse({
            status: 409,
            error: { error: { message: 'Tests are already running' } },
        }));

        fixture.detectChanges();
        await Promise.resolve();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Could not run tests: Tests are already running');
    });

    it('shows the HTTP error message when the response body is empty', async () => {
        runTests.mockRejectedValue(new HttpErrorResponse({ status: 500, error: null }));

        fixture.detectChanges();
        await Promise.resolve();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Could not run tests: Http failure response');
    });

    it('shows the HTTP error message when the response body has no API error', async () => {
        runTests.mockRejectedValue(new HttpErrorResponse({ status: 500, error: {} }));

        fixture.detectChanges();
        await Promise.resolve();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Could not run tests: Http failure response');
    });

    it('shows the HTTP error message when the API error has no string message', async () => {
        runTests.mockRejectedValue(new HttpErrorResponse({
            status: 500,
            error: { error: { message: 500 } },
        }));

        fixture.detectChanges();
        await Promise.resolve();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Could not run tests: Http failure response');
    });

    it('shows a fallback message for non-Error failures', async () => {
        runTests.mockRejectedValue('failure');

        fixture.detectChanges();
        await Promise.resolve();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Could not run tests: Unknown error');
    });

    it('disables repeated runs while a request is active', () => {
        let finishRun: ((exitCode: number) => void) | undefined;
        runTests.mockImplementation(() => new Promise(resolve => finishRun = resolve));

        fixture.detectChanges();
        component.runTests();

        expect(runTests).toHaveBeenCalledTimes(1);
        expect(component.isRunning).toBe(true);

        finishRun?.(0);
        expect(component.isRunning).toBe(true);
    });
});
