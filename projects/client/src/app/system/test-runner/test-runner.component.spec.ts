import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { BackendService, TestRunResult } from '../../backend.service';
import { TestRunnerComponent } from './test-runner.component';

describe('TestRunnerComponent', () => {
    let fixture: ComponentFixture<TestRunnerComponent>;
    let component: TestRunnerComponent;
    let runTests: jest.Mock;

    beforeEach(async () => {
        runTests = jest.fn();
        await TestBed.configureTestingModule({
            imports: [TestRunnerComponent],
            providers: [{ provide: BackendService, useValue: { runTests } }],
        }).compileComponents();

        fixture = TestBed.createComponent(TestRunnerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('renders a button to run the test suites', () => {
        expect(fixture.nativeElement.textContent).toContain('Run tests');
    });

    it('shows standard and error output after the test suites complete', () => {
        const result: TestRunResult = {
            exitCode: 0,
            stdout: 'Client and server tests passed',
            stderr: 'warning',
        };
        runTests.mockReturnValue(of(result));

        component.runTests();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Tests passed (exit code 0)');
        expect(fixture.nativeElement.textContent).toContain(result.stdout);
        expect(fixture.nativeElement.textContent).toContain(result.stderr);
    });

    it('shows the nonzero exit code when tests fail', () => {
        runTests.mockReturnValue(of({
            exitCode: 1,
            stdout: 'A test failed',
            stderr: '',
        }));

        component.runTests();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Tests failed (exit code 1)');
    });

    it('shows an API error when the request fails', () => {
        runTests.mockReturnValue(throwError(() => new Error('Server unavailable')));

        component.runTests();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Could not run tests: Server unavailable');
    });

    it('shows the message returned by the API', () => {
        runTests.mockReturnValue(throwError(() => new HttpErrorResponse({
            status: 409,
            error: { error: { message: 'Tests are already running' } },
        })));

        component.runTests();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Could not run tests: Tests are already running');
    });

    it('shows the HTTP error message when the response body is empty', () => {
        runTests.mockReturnValue(throwError(() => new HttpErrorResponse({
            status: 500,
            error: null,
        })));

        component.runTests();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Could not run tests: Http failure response');
    });

    it('shows the HTTP error message when the response body is not an object', () => {
        runTests.mockReturnValue(throwError(() => new HttpErrorResponse({
            status: 500,
            error: 'Request failed',
        })));

        component.runTests();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Could not run tests: Http failure response');
    });

    it('shows the HTTP error message when the response has no API error field', () => {
        runTests.mockReturnValue(throwError(() => new HttpErrorResponse({
            status: 500,
            error: {},
        })));

        component.runTests();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Could not run tests: Http failure response');
    });

    it('shows the HTTP error message when the API error is empty', () => {
        runTests.mockReturnValue(throwError(() => new HttpErrorResponse({
            status: 500,
            error: { error: null },
        })));

        component.runTests();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Could not run tests: Http failure response');
    });

    it('shows the HTTP error message when the API error is not an object', () => {
        runTests.mockReturnValue(throwError(() => new HttpErrorResponse({
            status: 500,
            error: { error: 'Request failed' },
        })));

        component.runTests();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Could not run tests: Http failure response');
    });

    it('shows the HTTP error message when the API error has no message', () => {
        runTests.mockReturnValue(throwError(() => new HttpErrorResponse({
            status: 500,
            error: { error: {} },
        })));

        component.runTests();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Could not run tests: Http failure response');
    });

    it('shows the HTTP error message when the API error message is not a string', () => {
        runTests.mockReturnValue(throwError(() => new HttpErrorResponse({
            status: 500,
            error: { error: { message: 500 } },
        })));

        component.runTests();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Could not run tests: Http failure response');
    });

    it('shows a fallback message for non-Error failures', () => {
        runTests.mockReturnValue(throwError(() => 'failure'));

        component.runTests();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Could not run tests: Unknown error');
    });

    it('disables repeated runs while a request is active', () => {
        const pendingRun = new Subject<TestRunResult>();
        runTests.mockReturnValue(pendingRun);

        component.runTests();
        component.runTests();

        expect(runTests).toHaveBeenCalledTimes(1);
        expect(component.isRunning).toBe(true);

        pendingRun.complete();
        expect(component.isRunning).toBe(false);
    });
});
