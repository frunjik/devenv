import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GlossaryComponent } from './glossary.component';

describe('GlossaryComponent', () => {
    let fixture: ComponentFixture<GlossaryComponent>;
    let http: HttpTestingController;

    beforeEach(async () => {
        (window as Window & { host?: string }).host = 'http://localhost:3000/';
        await TestBed.configureTestingModule({
            imports: [GlossaryComponent],
            providers: [provideHttpClient(), provideHttpClientTesting()],
        }).compileComponents();
        http = TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(GlossaryComponent);
        fixture.detectChanges();
    });

    afterEach(() => http.verify());

    it('displays the loaded items', () => {
        http.expectOne('http://localhost:3000/glossary').flush({ data: ['Term', 'Model'] });
        fixture.detectChanges();

        expect(Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.glossary-term'))
            .map(item => item.textContent)).toEqual(['Term', 'Model']);
    });

    it('shows an empty message when there is nothing to show', () => {
        http.expectOne('http://localhost:3000/glossary').flush({ data: [] });
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('No terms yet.');
    });

    it('shows an error message when loading fails', () => {
        http.expectOne('http://localhost:3000/glossary').flush({ error: { message: 'boom' } }, { status: 500, statusText: 'Server Error' });
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('500');
        expect(fixture.nativeElement.textContent).not.toContain('No terms yet.');
    });
});