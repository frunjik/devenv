import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { GlossaryComponent } from './glossary.component';

describe('GlossaryComponent route', () => {
    it('renders the empty glossary page at /glossary', async () => {
        TestBed.configureTestingModule({
            providers: [provideRouter(routes)],
        });

        const harness = await RouterTestingHarness.create();
        const component = await harness.navigateByUrl('/glossary', GlossaryComponent);

        expect(component).toBeInstanceOf(GlossaryComponent);
        expect(harness.routeNativeElement?.textContent?.trim()).toBe('');
    });
});
