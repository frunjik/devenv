import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SystemPlanComponent } from './system-plan.component';

describe('SystemPlanComponent', () => {
    let fixture: ComponentFixture<SystemPlanComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SystemPlanComponent],
            providers: [provideRouter([])],
        }).compileComponents();

        fixture = TestBed.createComponent(SystemPlanComponent);
        fixture.detectChanges();
    });

    it('shows the plan status summary and all registered concerns', () => {
        const text = fixture.nativeElement.textContent as string;

        expect(text).toContain('System plan');
        expect(text).toContain('5 validated');
        expect(text).toContain('5 in progress');
        expect(text).toContain('Distinguish input from ticket');
        expect(text).toContain('Visualize the current system plan');
        expect(Array.from(fixture.nativeElement.querySelectorAll('.concern-id'))
            .map((identifier: Element) => identifier.textContent?.trim()))
            .toEqual(['SC-001', 'SC-002', 'SC-003', 'SC-004', 'SC-005',
                'SC-006', 'SC-007', 'SC-008', 'SC-009', 'SC-010']);
        expect(fixture.nativeElement.querySelector('progress').value).toBe(5);
        expect(fixture.nativeElement.querySelector('progress').max).toBe(10);
        expect(fixture.nativeElement.querySelector('header a').getAttribute('href'))
            .toBe('/problem-inquiry');
    });

    it('shows dependencies and makes the snapshot limitation clear', () => {
        const text = fixture.nativeElement.textContent as string;

        expect(text).toContain('Prerequisites');
        expect(text).toContain('SC-001, SC-002');
        expect(text).toContain('Snapshot, not live data.');
        expect(text).toContain('manually synchronized');
    });

    it('presents each concern id as the single ticket identifier, not an ordered-list number', () => {
        const list = fixture.nativeElement.querySelector('.concern-list') as HTMLElement;
        const identifiers = fixture.nativeElement.querySelectorAll('.concern-id');

        expect(list.tagName).toBe('UL');
        expect(fixture.nativeElement.querySelector('ol.concern-list')).toBeNull();
        expect(identifiers).toHaveLength(10);
        expect(identifiers[0].textContent.trim()).toBe('SC-001');
        expect(identifiers[9].textContent.trim()).toBe('SC-010');
        expect(fixture.nativeElement.querySelectorAll('.concern-card')).toHaveLength(10);
    });
});
