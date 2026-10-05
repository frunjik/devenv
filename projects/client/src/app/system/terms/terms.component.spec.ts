import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
import { routes } from '../../app.routes';
import { TermsComponent } from './terms.component';

describe('TermsComponent route', () => {
    it('renders the empty terms page at /terms', async () => {
        TestBed.configureTestingModule({
            providers: [provideRouter(routes)],
        });

        const harness = await RouterTestingHarness.create();
        const component = await harness.navigateByUrl('/terms', TermsComponent);

        expect(component).toBeInstanceOf(TermsComponent);
        expect(harness.routeNativeElement?.textContent?.trim()).toBe('');
    });
});
