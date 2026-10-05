import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportedNote } from '@shared';
import { ImportedNotesListComponent } from './imported-notes-list.component';

describe('ImportedNotesListComponent', () => {
    let fixture: ComponentFixture<ImportedNotesListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ImportedNotesListComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ImportedNotesListComponent);
        fixture.detectChanges();
    });

    it('shows an empty state when no notes have been accepted', () => {
        expect(fixture.nativeElement.textContent).toContain('No accepted notes yet.');
    });

    it('shows accepted notes with their source, origin, verification, and open questions', () => {
        fixture.componentRef.setInput('notes', [makeNote({
            sourceText: 'The screen rejects quantity zero.',
            artifact: 'unclear-validation-report.txt',
            locator: 'opening paragraph',
            sourceOrigin: 'synthetic',
            verificationStatus: 'unreviewed',
            interpretation: 'The cause is still unclear.',
            openQuestions: ['Is zero allowed?', 'Which rule applies?'],
            acceptedAt: '2026-10-05T12:00:00.000Z',
        })]);
        fixture.detectChanges();

        const content = fixture.nativeElement.textContent as string;
        expect(content).toContain('The cause is still unclear.');
        expect(content).toContain('The screen rejects quantity zero.');
        expect(content).toContain('unclear-validation-report.txt');
        expect(content).toContain('opening paragraph');
        expect(content).toContain('synthetic');
        expect(content).toContain('unreviewed');
        expect(content).toContain('Is zero allowed?');
        expect(content).toContain('Which rule applies?');
        expect(content).not.toContain('No accepted notes yet.');
        expect(fixture.nativeElement.querySelector('time').getAttribute('datetime'))
            .toBe('2026-10-05T12:00:00.000Z');
    });

    it('shows absent provenance and questions without inventing values', () => {
        fixture.componentRef.setInput('notes', [makeNote({
            sourceText: 'A source fragment.',
            artifact: null,
            locator: null,
            sourceOrigin: 'unknown',
            verificationStatus: 'unreviewed',
            interpretation: 'An unresolved interpretation.',
            openQuestions: [],
            acceptedAt: '2026-10-05T12:00:00.000Z',
        })]);
        fixture.detectChanges();

        const content = fixture.nativeElement.textContent as string;
        expect(content).toContain('Source reference not recorded.');
        expect(content).toContain('No open questions recorded.');
        expect(content).toContain('unknown');
    });

    function makeNote(input: {
        sourceText: string;
        artifact: string | null;
        locator: string | null;
        sourceOrigin: 'synthetic' | 'unknown';
        verificationStatus: 'unreviewed';
        interpretation: string;
        openQuestions: string[];
        acceptedAt: string;
    }): ImportedNote {
        return {
            id: 'note-1',
            proposal: {
                sourceText: input.sourceText,
                sourceReference: { artifact: input.artifact, locator: input.locator },
                sourceOrigin: input.sourceOrigin,
                verificationStatus: input.verificationStatus,
                interpretation: input.interpretation,
                openQuestions: input.openQuestions,
            },
            acceptedAt: input.acceptedAt,
        };
    }
});
