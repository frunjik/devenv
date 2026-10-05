import { beforeEach, describe, expect, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProblemInquiryPageComponent } from './problem-inquiry-page.component';

describe('ProblemInquiryPageComponent', () => {
    let fixture: ComponentFixture<ProblemInquiryPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ProblemInquiryPageComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ProblemInquiryPageComponent);
        fixture.detectChanges();
    });

    it('adds a note to the list only after explicit acceptance', () => {
        setText('#source-text', 'The scan timed out and may have been applied.');
        setText('#interpretation', 'The operation outcome is uncertain.');
        submitForm();

        expect(fixture.nativeElement.textContent).toContain('No accepted notes yet.');
        expect(fixture.nativeElement.textContent).toContain('Review note proposal');

        fixture.nativeElement.querySelector('#accept-note').click();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('The operation outcome is uncertain.');
        expect(fixture.nativeElement.textContent).not.toContain('No accepted notes yet.');
        expect(fixture.nativeElement.textContent).toContain('unreviewed');
    });

    it('creates and lists a ticket only after explicit framing from an accepted note', () => {
        setText('#source-text', 'The scan timed out and may have been applied.');
        setText('#interpretation', 'The operation outcome is uncertain.');
        submitForm();
        fixture.nativeElement.querySelector('#accept-note').click();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('No framed problem tickets yet.');
        const sourceNotes = fixture.nativeElement.querySelector('#source-note-ids') as HTMLSelectElement;
        expect(sourceNotes.options.length).toBe(1);
        sourceNotes.options[0].selected = true;
        setText('#ticket-title', 'Unclear scan outcome');
        setText('#ticket-report', 'A manually entered ticket report.');
        setText('#problem-condition', 'The scan result is unclear after a timeout.');
        setText('#problem-affected', 'Warehouse operator');
        setText('#problem-impact', 'The operator cannot confirm the operation outcome.');
        setText('#scope-level', 'workflow');
        setText('#scope-label', 'Outbound scanning');
        setText('#reported-by', 'A. Reporter');
        setText('#reported-at', '2026-10-05T12:00');

        const ticketForm = sourceNotes.closest('form') as HTMLFormElement;
        ticketForm.dispatchEvent(new Event('submit'));
        fixture.detectChanges();

        const content = fixture.nativeElement.textContent as string;
        expect(fixture.nativeElement.querySelectorAll('.ticket-card').length).toBe(1);
        expect(content).toContain('Unclear scan outcome');
        expect(content).toContain('A manually entered ticket report.');
        expect(content).toContain('The scan result is unclear after a timeout.');
        expect(content).toContain('note-1');
        expect(content).toContain('The scan timed out and may have been applied.');
        expect(content).toContain('The operation outcome is uncertain.');
    });

    function setText(selector: string, value: string): void {
        const control = fixture.nativeElement.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement;
        control.value = value;
        control.dispatchEvent(new Event('input'));
    }

    function submitForm(): void {
        fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
        fixture.detectChanges();
    }
});
