import { beforeEach, describe, expect, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportedNote, NoteProposal } from '@shared';
import { InputConverterComponent } from './input-converter.component';

describe('InputConverterComponent', () => {
    let fixture: ComponentFixture<InputConverterComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [InputConverterComponent],
        }).compileComponents();
        fixture = TestBed.createComponent(InputConverterComponent);
        fixture = TestBed.createComponent(InputConverterComponent);
        fixture = TestBed.createComponent(InputConverterComponent);
    });

    it('emits a local proposal retaining the source text and interpretation', () => {
        const proposals: NoteProposal[] = [];
        fixture.componentInstance.proposalCreated.subscribe(proposal => proposals.push(proposal));

        const sourceText = fixture.nativeElement.querySelector('#source-text') as HTMLTextAreaElement;
        sourceText.value = '  The screen rejects quantity zero.  ';
        sourceText.dispatchEvent(new Event('input'));

        const interpretation = fixture.nativeElement.querySelector('#interpretation') as HTMLTextAreaElement;
        interpretation.value = 'The rejection cause is not known.';
        interpretation.dispatchEvent(new Event('input'));

        fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

        expect(proposals).toEqual([{
            sourceText: '  The screen rejects quantity zero.  ',
            sourceReference: {
                artifact: null,
                locator: null,
            },
            sourceOrigin: 'unknown',
            verificationStatus: 'unreviewed',
            interpretation: 'The rejection cause is not known.',
            openQuestions: [],
        }]);
    });

    it('does not emit a proposal when the source text is blank', () => {
        const proposals: NoteProposal[] = [];
        fixture.componentInstance.proposalCreated.subscribe(proposal => proposals.push(proposal));
        const interpretation = fixture.nativeElement.querySelector('#interpretation') as HTMLTextAreaElement;
        interpretation.value = 'A tentative interpretation.';
        interpretation.dispatchEvent(new Event('input'));

        fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
        fixture.detectChanges();

        expect(proposals).toEqual([]);
        expect(fixture.nativeElement.textContent).toContain('Enter source text and an interpretation');
    });

    it('does not emit a proposal when the interpretation is blank', () => {
        const proposals: NoteProposal[] = [];
        fixture.componentInstance.proposalCreated.subscribe(proposal => proposals.push(proposal));
        enterText('#source-text', 'A source report.');

        submitForm();

        expect(proposals).toEqual([]);
        expect(fixture.nativeElement.textContent).toContain('Enter source text and an interpretation');
    });

    it('keeps non-empty open questions and removes blank lines', () => {
        const proposals: NoteProposal[] = [];
        fixture.componentInstance.proposalCreated.subscribe(proposal => proposals.push(proposal));

        enterText('#source-text', 'A source report.');
        enterText('#interpretation', 'A tentative interpretation.');
        enterText('#open-questions', 'Is this a domain rule?\n\nWhich configuration applies?');
        submitForm();

        expect(proposals).toEqual([{
            sourceText: 'A source report.',
            sourceReference: {
                artifact: null,
                locator: null,
            },
            sourceOrigin: 'unknown',
            verificationStatus: 'unreviewed',
            interpretation: 'A tentative interpretation.',
            openQuestions: ['Is this a domain rule?', 'Which configuration applies?'],
        }]);
    });

    it('keeps source origin separate from verification status and cites the source', () => {
        const proposals: NoteProposal[] = [];
        fixture.componentInstance.proposalCreated.subscribe(proposal => proposals.push(proposal));
        enterText('#source-text', 'A generated example report.');
        enterText('#interpretation', 'A tentative interpretation.');
        enterText('input#source-artifact', 'grouped/operator-shift-notes.txt');
        enterText('input#source-locator', 'the paragraph about wireless retries');
        const syntheticRadio = fixture.nativeElement.querySelector(
            'input[name="source-origin"][value="synthetic"]',
        ) as HTMLInputElement;
        syntheticRadio.click();
        submitForm();

        expect(proposals).toEqual([{
            sourceText: 'A generated example report.',
            sourceReference: {
                artifact: 'grouped/operator-shift-notes.txt',
                locator: 'the paragraph about wireless retries',
            },
            sourceOrigin: 'synthetic',
            verificationStatus: 'unreviewed',
            interpretation: 'A tentative interpretation.',
            openQuestions: [],
        }]);
    });

    it('requires explicit acceptance before emitting an imported note', () => {
        const importedNotes: ImportedNote[] = [];
        fixture.componentInstance.noteAccepted.subscribe(note => importedNotes.push(note));

        enterText('#source-text', 'A synthetic source report.');
        enterText('#interpretation', 'A tentative interpretation.');
        submitForm();

        expect(importedNotes).toEqual([]);
        expect(fixture.nativeElement.querySelector('#accept-note')).not.toBeNull();

        fixture.nativeElement.querySelector('#accept-note').click();
        fixture.detectChanges();

        expect(importedNotes).toHaveLength(1);
        expect(importedNotes[0].proposal).toEqual({
            sourceText: 'A synthetic source report.',
            sourceReference: { artifact: null, locator: null },
            sourceOrigin: 'unknown',
            verificationStatus: 'unreviewed',
            interpretation: 'A tentative interpretation.',
            openQuestions: [],
        });
        expect(importedNotes[0].id).toBe('note-1');
        expect(Number.isNaN(Date.parse(importedNotes[0].acceptedAt))).toBe(false);
        expect(fixture.nativeElement.querySelector('#accept-note')).toBeNull();
    });

    it('assigns a distinct in-memory identity to each accepted note', () => {
        const importedNotes: ImportedNote[] = [];
        fixture.componentInstance.noteAccepted.subscribe(note => importedNotes.push(note));

        enterText('#source-text', 'First report.');
        enterText('#interpretation', 'First interpretation.');
        submitForm();
        fixture.nativeElement.querySelector('#accept-note').click();
        fixture.detectChanges();

        enterText('#source-text', 'Second report.');
        enterText('#interpretation', 'Second interpretation.');
        submitForm();
        fixture.nativeElement.querySelector('#accept-note').click();

        expect(importedNotes.map(note => note.id)).toEqual(['note-1', 'note-2']);
    });

    it('returns a proposal to editable input without changing its source text', () => {
        const proposals: NoteProposal[] = [];
        fixture.componentInstance.proposalCreated.subscribe(proposal => proposals.push(proposal));
        enterText('#source-text', 'A source report.');
        enterText('#interpretation', 'First interpretation.');
        submitForm();

        fixture.nativeElement.querySelector('#edit-proposal').click();
        fixture.detectChanges();
        enterText('#interpretation', 'Revised interpretation.');
        submitForm();

        expect(proposals).toHaveLength(2);
        expect(proposals[1]).toMatchObject({
            sourceText: 'A source report.',
            interpretation: 'Revised interpretation.',
        });
        expect(fixture.nativeElement.textContent).toContain('Revised interpretation.');
    });

    it('rejects a proposal, recording an optional reason and the time, and returns to the form', () => {
        const reviewed: { proposal: NoteProposal; decision: { outcome: string; reason?: string; decidedAt: string } }[] = [];
        fixture.componentInstance.proposalReviewed.subscribe(entry => reviewed.push(entry));
        enterText('#source-text', 'A source report.');
        enterText('#interpretation', 'An interpretation.');
        submitForm();

        enterText('#review-reason', 'Does not describe a real condition.');
        fixture.nativeElement.querySelector('#reject-proposal').click();
        fixture.detectChanges();

        expect(reviewed).toHaveLength(1);
        expect(reviewed[0].proposal).toMatchObject({ sourceText: 'A source report.' });
        expect(reviewed[0].decision.outcome).toBe('rejected');
        expect(reviewed[0].decision.reason).toBe('Does not describe a real condition.');
        expect(Number.isNaN(Date.parse(reviewed[0].decision.decidedAt))).toBe(false);
        expect(fixture.nativeElement.querySelector('#accept-note')).toBeNull();
        expect(fixture.nativeElement.querySelector('#source-text')).not.toBeNull();
    });

    it('defers a proposal without a reason, leaving reason undefined', () => {
        const reviewed: { proposal: NoteProposal; decision: { outcome: string; reason?: string } }[] = [];
        fixture.componentInstance.proposalReviewed.subscribe(entry => reviewed.push(entry));
        enterText('#source-text', 'A source report.');
        enterText('#interpretation', 'An interpretation.');
        submitForm();

        fixture.nativeElement.querySelector('#defer-proposal').click();
        fixture.detectChanges();

        expect(reviewed).toHaveLength(1);
        expect(reviewed[0].decision.outcome).toBe('deferred');
        expect(reviewed[0].decision.reason).toBeUndefined();
    });

    function enterText(selector: string, value: string): void {
        const input = fixture.nativeElement.querySelector(
            selector,
        ) as HTMLInputElement | HTMLTextAreaElement;
        input.value = value;
        input.dispatchEvent(new Event('input'));
    }

    function submitForm(): void {
        fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
        fixture.detectChanges();
    }
});
