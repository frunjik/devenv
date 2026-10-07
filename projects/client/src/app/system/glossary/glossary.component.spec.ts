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

    it('presents each term with its definition, without the list marker', () => {
        http.expectOne('http://localhost:3000/glossary').flush({
            data: ['Term', '- A word with an agreed meaning.', 'Domain', '- A bounded area.', '- Seen in a context.'],
        });
        fixture.detectChanges();

        const entries = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.glossary-entry'));
        expect(entries.map(entry => entry.querySelector('.glossary-term')?.textContent)).toEqual(['Term', 'Domain']);
        expect(Array.from<HTMLElement>(entries[0].querySelectorAll('.glossary-definition:not(.glossary-domains)')).map(item => item.textContent))
            .toEqual(['A word with an agreed meaning.']);
        expect(Array.from<HTMLElement>(entries[1].querySelectorAll('.glossary-definition:not(.glossary-domains)')).map(item => item.textContent))
            .toEqual(['A bounded area.', 'Seen in a context.']);
    });

    it('shows a term that has no definition without an empty definition', () => {
        http.expectOne('http://localhost:3000/glossary').flush({ data: ['Model'] });
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('.glossary-entry').length).toBe(1);
        expect(fixture.nativeElement.querySelector('.glossary-definition:not(.glossary-domains)')).toBeNull();
    });

    it('separates recorded examples from definitions and preserves example-qualified names', () => {
        http.expectOne('http://localhost:3000/glossary').flush({
            data: [
                'Domain (WMS)', '- A context of meaning.',
                'KnowledgeArea', '- A subject classification.',
                '- Example: KnowledgeArea (warehouse operations).',
                '- Example: KnowledgeArea (development practices).',
                'MetaLayer (DevEnv)', '- A perspective.',
            ],
        });
        fixture.detectChanges();

        expect(fixture.componentInstance.entries).toEqual([
            { term: 'Domain (WMS)', definitions: ['A context of meaning.'], examples: [], domains: [] },
            {
                term: 'KnowledgeArea', definitions: ['A subject classification.'],
                examples: ['KnowledgeArea (warehouse operations).', 'KnowledgeArea (development practices).'],
                domains: [],
            },
            { term: 'MetaLayer (DevEnv)', definitions: ['A perspective.'], examples: [], domains: [] },
        ]);
        const entry: HTMLElement = fixture.nativeElement.querySelectorAll('.glossary-entry')[1];
        expect(Array.from(entry.querySelectorAll('.glossary-definition:not(.glossary-example):not(.glossary-domains)')).map(item => item.textContent))
            .toEqual(['A subject classification.']);
        expect(Array.from(entry.querySelectorAll('.glossary-example')).map(item => item.textContent))
            .toEqual([
                'Example: KnowledgeArea (warehouse operations).',
                'Example: KnowledgeArea (development practices).',
            ]);
    });

    it('shows recorded usage Domains separately without inferring them from names', () => {
        http.expectOne('http://localhost:3000/glossary').flush({
            data: ['MetaLayer (DevEnv)', '- A perspective.', '- Domains: DevEnv, Meta',
                'SubjectDomain (WMS AI)', '- A Domain.', '- Domains: Meta',
                'Domain (WMS)', '- A context.'],
        });
        fixture.detectChanges();
        expect(fixture.componentInstance.entries.map(entry => entry.domains))
            .toEqual([['DevEnv', 'Meta'], ['Meta'], []]);
        expect(Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.glossary-domains'))
            .map(item => item.textContent?.trim())).toEqual([
                'Known usage Domains: DevEnv, Meta',
                'Known usage Domains: Meta',
                'Usage Domains not recorded.',
            ]);
    });

    it.each(['- Domains:', '- Domains: Meta, ', '- Domains: , Meta'])('reports invalid usage metadata %s', line => {
        http.expectOne('http://localhost:3000/glossary').flush({ data: ['Term', line] });
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('[role="alert"]').textContent)
            .toContain('Usage Domains must contain non-empty labels');
        expect(fixture.componentInstance.entries).toEqual([]);
    });

    it('keeps a definition line that has no term in front of it visible', () => {
        http.expectOne('http://localhost:3000/glossary').flush({ data: ['- Orphan text', 'Term', '- Definition'] });
        fixture.detectChanges();

        const terms = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.glossary-term'));
        expect(terms.map(item => item.textContent)).toEqual(['- Orphan text', 'Term']);
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