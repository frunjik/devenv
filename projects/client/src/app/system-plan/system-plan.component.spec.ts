import { beforeEach, describe, expect, it } from '@jest/globals';
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
        expect(text).toContain('21 validated');
        expect(text).toContain('4 in progress');
        expect(text).toContain('16 ready');
        expect(text).toContain('Distinguish input from ticket');
        expect(text).toContain('Visualize the current system plan');
        expect(text).toContain('Define note-to-ticket relationships');
        expect(text).toContain('Connect note framing to ticket review');
        expect(text).toContain('Toggle sample and real data');
        expect(text).toContain('Explore a wide-screen inquiry layout');
        expect(text).toContain('Clarify what a system concern is');
        const identifiers = fixture.nativeElement.querySelectorAll('.concern-id') as NodeListOf<HTMLElement>;
        expect(Array.from(identifiers).map(identifier => identifier.textContent?.trim()))
            .toEqual(['SC-001', 'SC-002', 'SC-003', 'SC-004', 'SC-005',
                'SC-006', 'SC-007', 'SC-008', 'SC-009', 'SC-010', 'SC-011',
                'SC-012', 'SC-013', 'SC-014', 'SC-015', 'SC-016', 'SC-017', 'SC-018',
                'SC-019', 'SC-020', 'SC-021',                 'SC-022', 'SC-023',                                 'SC-024', 'SC-025', 'SC-026', 'SC-027', 'SC-028', 'SC-029', 'SC-030', 'SC-031', 'SC-032', 'SC-033', 'SC-034', 'SC-035', 'SC-036', 'SC-037', 'SC-038', 'SC-039', 'SC-040', 'SC-041']);
        expect(fixture.nativeElement.querySelector('progress').value).toBe(21);
                        expect(fixture.nativeElement.querySelector('progress').max).toBe(41);
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
        expect(identifiers.length).toBe(41);
        expect(identifiers[0].textContent.trim()).toBe('SC-001');
        expect(identifiers[40].textContent.trim()).toBe('SC-041');
        expect(fixture.nativeElement.querySelectorAll('.concern-card').length).toBe(41);
    });
});
