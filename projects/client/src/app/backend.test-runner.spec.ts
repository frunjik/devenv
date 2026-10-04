import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { BackendService, TestRunResult } from './backend.service';
import { LoggerService } from './logger.service';

describe('BackendService test runner', () => {
    let service: BackendService;
    let httpTestingController: HttpTestingController;
    const browserWindow = window as Window & { host?: string };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                {
                    provide: LoggerService,
                    useValue: { error: (_message: string, _error: Error) => undefined },
                },
            ],
        });
        service = TestBed.inject(BackendService);
        httpTestingController = TestBed.inject(HttpTestingController);
        browserWindow.host = 'http://localhost:3000/';
    });

    afterEach(() => {
        httpTestingController.verify();
        delete browserWindow.host;
    });

    it('posts to the test-run endpoint and returns its output', async () => {
        const result: TestRunResult = {
            exitCode: 0,
            stdout: 'All tests passed',
            stderr: '',
        };
        const response = service.runTests().toPromise();
        const request = httpTestingController.expectOne('http://localhost:3000/tests/run');

        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual({});

        request.flush({ data: result });
        await expect(response).resolves.toEqual(result);
    });
});
