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
