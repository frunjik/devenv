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

    it('includes a decorative search icon beside the labelled search input', () => {
        http.expectOne('http://localhost:3000/glossary').flush({
            data: [{ term: 'Outcome', definitions: [], examples: [], domains: [] }],
        });
        fixture.detectChanges();
        const host: HTMLElement = fixture.nativeElement;
        const icon = host.querySelector('.glossary-search-input svg');
        expect(icon).not.toBeNull();
        expect(icon?.getAttribute('aria-hidden')).toBe('true');
        expect(icon?.getAttribute('focusable')).toBe('false');
        expect(host.querySelector('.glossary-search-input input')?.id).toBe('glossary-search');
    });

    it('preserves search across tabs and names Project in empty and unmatched results', () => {
        http.expectOne('http://localhost:3000/glossary').flush({
            data: [
                { term: 'Outcome', definitions: [], examples: [], domains: ['DevEnv'] },
                { term: 'Understand', definitions: ['Outcome clarity'], examples: [], domains: ['AgentPhaseGuide'] },
            ],
        });
        fixture.detectChanges();
        const host: HTMLElement = fixture.nativeElement;
        const search = host.querySelector<HTMLInputElement>('#glossary-search')!;
        search.value = ' outcome ';
        search.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(host.querySelector('.glossary-term')!.textContent).toBe('Outcome');
        host.querySelector<HTMLButtonElement>('#glossary-project-tab')!.click();
        fixture.detectChanges();
        expect(search.value).toBe(' outcome ');
        expect(host.querySelector('.glossary-term')!.textContent).toBe('Understand');
        search.value = 'unknown';
        search.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(host.textContent).toContain('No Project Terms found.');
        fixture.componentInstance.entries = fixture.componentInstance.entries.filter(entry => entry.term === 'Outcome');
        fixture.detectChanges();
        expect(host.textContent).toContain('No Project Terms found.');
        expect(host.querySelectorAll('.glossary-empty')).toHaveLength(1);
    });

    it.each([
        ['system', 'ArrowRight', 'project'], ['system', 'ArrowLeft', 'project'],
        ['system', 'Home', 'system'], ['system', 'End', 'project'],
        ['project', 'ArrowRight', 'system'], ['project', 'ArrowLeft', 'system'],
        ['project', 'Home', 'system'], ['project', 'End', 'project'],
    ])('supports %s tab keyboard %s to %s', (start, key, destination) => {
        http.expectOne('http://localhost:3000/glossary').flush({ data: [] });
        const host: HTMLElement = fixture.nativeElement;
        const tab = host.querySelector<HTMLButtonElement>(`#glossary-${start}-tab`)!;
        tab.click();
        fixture.detectChanges();
        const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
        tab.dispatchEvent(event);
        fixture.detectChanges();
        const selected = host.querySelector<HTMLButtonElement>(`#glossary-${destination}-tab`)!;
        expect(selected.getAttribute('aria-selected')).toBe('true');
        expect(selected.tabIndex).toBe(0);
        expect(document.activeElement).toBe(selected);
        expect(event.defaultPrevented).toBe(true);
        expect(host.querySelector('[role="tabpanel"]')!.getAttribute('aria-labelledby')).toBe(selected.id);
    });

    it('partitions AgentPhaseGuide terms into Project and all remaining terms into System', () => {
        http.expectOne('http://localhost:3000/glossary').flush({
            data: [
                { term: 'Understand', definitions: ['Clarify intent'], examples: [], domains: ['AgentPhaseGuide', 'Meta'] },
                { term: 'SystemConcern', definitions: [], examples: [], domains: ['DevEnv'] },
                { term: 'Unknown', definitions: [], examples: [], domains: [] },
            ],
        });
        fixture.detectChanges();
        const host: HTMLElement = fixture.nativeElement;
        const terms = () => Array.from(host.querySelectorAll('.glossary-term'), item => item.textContent);
        expect(Array.from(host.querySelectorAll('[role="tab"]'), tab => tab.textContent?.trim())).toEqual(['System', 'Project']);
        expect(terms()).toEqual(['SystemConcern', 'Unknown']);
        host.querySelector<HTMLButtonElement>('#glossary-project-tab')!.click();
        fixture.detectChanges();
        expect(terms()).toEqual(['Understand']);
        expect(host.querySelector('#glossary-project-tab')!.getAttribute('aria-selected')).toBe('true');
        host.querySelector<HTMLButtonElement>('#glossary-system-tab')!.click();
        fixture.detectChanges();
        expect(terms()).toEqual(['SystemConcern', 'Unknown']);
    });

    it('displays structured terms returned by the API', () => {
        http.expectOne('http://localhost:3000/glossary').flush({
            data: [
                { term: 'Term', definitions: ['A word with meaning.'], examples: [], domains: [] },
                { term: 'Model', definitions: [], examples: [], domains: [] },
            ],
        });
        fixture.detectChanges();

        expect(Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.glossary-term'))
            .map(item => item.textContent)).toEqual(['Term', 'Model']);
        expect(Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.glossary-definition:not(.glossary-domains)'))
            .map(item => item.textContent)).toEqual(['A word with meaning.']);
        expect(fixture.nativeElement.querySelector('.glossary-domain-unknown').textContent).toBe('Unknown');
    });

    it('displays definitions, examples, and known usage in separate groups', () => {
        http.expectOne('http://localhost:3000/glossary').flush({
            data: [{
                term: 'KnowledgeArea (WMS operations)',
                definitions: ['A subject classification.'],
                examples: ['Warehouse operations.'],
                domains: ['DevEnv', 'Meta'],
            }],
        });
        fixture.detectChanges();

        const entry: HTMLElement = fixture.nativeElement.querySelector('.glossary-entry');
        expect(entry.querySelector('.glossary-term')?.textContent).toBe('KnowledgeArea (WMS operations)');
        expect(Array.from<HTMLElement>(entry.querySelectorAll('.glossary-definition:not(.glossary-example):not(.glossary-examples):not(.glossary-domains)'))
            .map(item => item.textContent)).toEqual(['A subject classification.']);
        expect(Array.from<HTMLElement>(entry.querySelectorAll('.glossary-example'))
            .map(item => item.textContent)).toEqual(['Example: Warehouse operations.']);
        const examples = entry.querySelector<HTMLDetailsElement>('details.glossary-examples');
        expect(examples?.open).toBe(false);
        expect(examples?.querySelector('summary')?.textContent).toBe('Examples (1)');
        expect(Array.from<HTMLElement>(entry.querySelectorAll('.glossary-domain-badge'))
            .map(item => item.textContent?.trim())).toEqual(['DevEnv', 'Meta']);
        expect(entry.querySelector('.glossary-domains-label')?.textContent).toBe('Domain usage:');
    });

    it('filters case-insensitively across terms, definitions, examples, and domains', () => {
        http.expectOne('http://localhost:3000/glossary').flush({
            data: [
                { term: 'Outcome', definitions: [], examples: [], domains: [] },
                { term: 'State', definitions: ['Observable completion'], examples: [], domains: [] },
                { term: 'Scenario', definitions: [], examples: ['Warehouse picker'], domains: [] },
                { term: 'Domain', definitions: [], examples: [], domains: ['WMS Operations'] },
            ],
        });
        fixture.detectChanges();

        const host: HTMLElement = fixture.nativeElement;
        const search = host.querySelector<HTMLInputElement>('#glossary-search');
        expect(search).not.toBeNull();
        if (search === null) {
            throw new Error('Glossary search input was not rendered');
        }

        const terms = (): string[] => Array.from<HTMLElement>(
            fixture.nativeElement.querySelectorAll('.glossary-term'),
        ).map(item => item.textContent?.trim() || '');
        const searchFor = (value: string): void => {
            search.value = value;
            search.dispatchEvent(new Event('input'));
            fixture.detectChanges();
        };

        searchFor(' outcome ');
        expect(terms()).toEqual(['Outcome']);
        searchFor('OBSERVABLE');
        expect(terms()).toEqual(['State']);
        searchFor('warehouse picker');
        expect(terms()).toEqual(['Scenario']);
        searchFor('wms operations');
        expect(terms()).toEqual(['Domain']);

        searchFor('no matching entry');
        expect(terms()).toEqual([]);
        expect(fixture.nativeElement.textContent).toContain('No System Terms found.');

        searchFor('  ');
        expect(terms()).toEqual(['Outcome', 'State', 'Scenario', 'Domain']);
        expect(fixture.nativeElement.textContent).not.toContain('No System Terms found.');
    });

    it('shows an empty message when the JSON array is empty', () => {
        http.expectOne('http://localhost:3000/glossary').flush({ data: [] });
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('No System Terms found.');
        fixture.nativeElement.querySelector('#glossary-project-tab').click();
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('No Project Terms found.');
    });

    it('shows an error message when loading fails', () => {
        http.expectOne('http://localhost:3000/glossary').flush(
            { error: { message: 'Invalid Glossary JSON' } },
            { status: 500, statusText: 'Server Error' },
        );
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('500');
        expect(fixture.nativeElement.textContent).not.toContain('Terms found.');
    });
});
