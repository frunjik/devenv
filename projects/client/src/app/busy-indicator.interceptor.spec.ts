import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { busyIndicatorInterceptor } from './busy-indicator.interceptor';
import { BusyIndicatorService } from './busy-indicator.service';

describe('busyIndicatorInterceptor', () => {
    let http: HttpTestingController;
    let client: HttpClient;
    let busyIndicator: BusyIndicatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([busyIndicatorInterceptor])),
                provideHttpClientTesting(),
            ],
        });
        http = TestBed.inject(HttpTestingController);
        client = TestBed.inject(HttpClient);
        busyIndicator = TestBed.inject(BusyIndicatorService);
    });

    afterEach(() => http.verify());

    it('stays busy until all concurrent requests finish', () => {
        client.get('/first').subscribe();
        client.get('/second').subscribe();

        expect(busyIndicator.isBusy()).toBe(true);

        http.expectOne('/first').flush({});
        expect(busyIndicator.isBusy()).toBe(true);

        http.expectOne('/second').flush({});
        expect(busyIndicator.isBusy()).toBe(false);
    });

    it('clears the busy state when a request errors', () => {
        client.get('/failure').subscribe({ error: () => undefined });

        expect(busyIndicator.isBusy()).toBe(true);
        http.expectOne('/failure').flush('failure', { status: 500, statusText: 'Server Error' });
        expect(busyIndicator.isBusy()).toBe(false);
    });
});
