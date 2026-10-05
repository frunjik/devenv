import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { StatusToolbarComponent } from './status-toolbar.component';
import { GitStatusService } from '../git-status.service';
import { CurrentEntryService } from '../current-entry.service';
import { TestRunCacheStatusService } from '../test-run-cache-status.service';
import { busyIndicatorInterceptor } from '../busy-indicator.interceptor';

describe('StatusToolbarComponent', () => {
    it('shows a busy indicator while an HTTP request is pending', () => {
        TestBed.configureTestingModule({
            imports: [StatusToolbarComponent],
            providers: [
                provideHttpClient(withInterceptors([busyIndicatorInterceptor])),
                provideHttpClientTesting(),
                provideRouter([]),
            ],
        });

        const fixture = TestBed.createComponent(StatusToolbarComponent);
        fixture.componentRef.setInput('gitStatus', TestBed.inject(GitStatusService));
        fixture.componentRef.setInput('currentEntry', TestBed.inject(CurrentEntryService));
        fixture.componentRef.setInput('testRunCacheStatus', TestBed.inject(TestRunCacheStatusService));
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('[aria-label="Client busy"]')).not.toBeNull();

        const request = TestBed.inject(HttpTestingController).expectOne('http://localhost:3000/version');
        request.flush({ data: '0.0.1' });
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('[aria-label="Client busy"]')).toBeNull();
    });
});
