import { describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { FeatureStatesComponent } from './feature-states.component';

describe('FeatureStatesComponent', () => {
    it('describes every feature status and how it is used', async () => {
        await TestBed.configureTestingModule({ imports: [FeatureStatesComponent] }).compileComponents();
        const fixture = TestBed.createComponent(FeatureStatesComponent);
        fixture.detectChanges();

        const names = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.feature-state-name'))
            .map(element => element.textContent!.trim());
        expect(names).toEqual([
            'Questions', 'Wished', 'Backlog', 'Queued', 'Committed', 'InProgress',
            'Delivered', 'Done', 'Aborted', 'Denied', 'Archived',
        ]);
        const usages = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.feature-state-usage'));
        expect(usages).toHaveLength(names.length);
        expect(usages.every(element => element.textContent!.trim().length > 0)).toBe(true);
        expect(usages[3].textContent).toContain('Start button');
    });
});
