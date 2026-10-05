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
        expect(Array.from(fixture.nativeElement.querySelectorAll('.concern-list h3'))
            .map((heading: Element) => heading.textContent?.trim().slice(0, 6)))
            .toEqual(['SC-001', 'SC-002', 'SC-003', 'SC-004', 'SC-005',
                'SC-006', 'SC-007', 'SC-008', 'SC-009', 'SC-010']);
        expect(fixture.nativeElement.querySelector('progress').value).toBe(5);
        expect(fixture.nativeElement.querySelector('progress').max).toBe(10);
        expect(fixture.nativeElement.querySelector('header a').getAttribute('href'))
            .toBe('/problem-inquiry');
    });

    it('shows dependencies and makes the snapshot limitation clear', () => {
        const text = fixture.nativeElement.textContent as string;

        expect(text).toContain('Depends on: SC-001, SC-002');
        expect(text).toContain('manually synchronized snapshot');
        expect(text).toContain('not live plan data');
    });
});
