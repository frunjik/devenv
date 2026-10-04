import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackendService } from '../../backend.service';
import { TestRunnerComponent } from './test-runner.component';

describe('TestRunnerComponent', () => {
    let fixture: ComponentFixture<TestRunnerComponent>;
    let component: TestRunnerComponent;
    let runTests: jest.MockedFunction<BackendService['runTests']>;

    beforeEach(async () => {
        runTests = jest.fn<BackendService['runTests']>();
        runTests.mockResolvedValue(0);
        await TestBed.configureTestingModule({
            imports: [TestRunnerComponent],
            providers: [{ provide: BackendService, useValue: { runTests } }],
        }).compileComponents();

        fixture = TestBed.createComponent(TestRunnerComponent);
        component = fixture.componentInstance;
    });

    it('automatically runs the test suites when the page opens', () => {
        fixture.detectChanges();

        expect(runTests).toHaveBeenCalledTimes(1);
        expect(fixture.nativeElement.querySelector('button')).not.toBeNull();
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
