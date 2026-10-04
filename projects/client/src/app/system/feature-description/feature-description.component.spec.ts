import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureDescriptionComponent } from './feature-description.component';

describe('FeatureDescriptionComponent', () => {
    let fixture: ComponentFixture<FeatureDescriptionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureDescriptionComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(FeatureDescriptionComponent);
        fixture.detectChanges();
    });

    it('shows a feature description form', () => {
        expect(fixture.nativeElement.querySelector('h1').textContent).toContain('New feature');
        expect(fixture.nativeElement.querySelector('textarea[aria-label="Feature description"]')).not.toBeNull();
    });

    it('holds the entered feature description in the form', async () => {
        const textarea: HTMLTextAreaElement =
            fixture.nativeElement.querySelector('textarea[aria-label="Feature description"]');

        textarea.value = 'Add a route for planning the next feature';
        textarea.dispatchEvent(new Event('input'));
        await fixture.whenStable();

        expect(fixture.componentInstance.description).toBe('Add a route for planning the next feature');
    });

});
