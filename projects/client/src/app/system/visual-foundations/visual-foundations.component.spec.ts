import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { VisualFoundationsComponent } from './visual-foundations.component';

describe('VisualFoundationsComponent', () => {
    beforeEach(() => { TestBed.configureTestingModule({ imports: [VisualFoundationsComponent] }); });
    afterEach(() => { TestBed.resetTestingModule(); });

    it('shows typography, semantic colors, controls and a labelled diagram without external data', () => {
        const fixture = TestBed.createComponent(VisualFoundationsComponent);
        fixture.detectChanges();
        const host: HTMLElement = fixture.nativeElement;
        expect([...host.querySelectorAll('h2')].map(heading => heading.textContent)).toEqual([
            'Typography', 'Color roles', 'Controls and states', 'Diagram hierarchy',
        ]);
        expect(host.querySelectorAll('.color-sample')).toHaveLength(11);
        expect(host.querySelector('svg')?.getAttribute('aria-label')).toContain('Client requests data from API');
        expect(host.textContent).toContain('Preview only');
    });

    it('toggles selection through the sample control and reports its state in text', () => {
        const fixture = TestBed.createComponent(VisualFoundationsComponent);
        fixture.detectChanges();
        const host: HTMLElement = fixture.nativeElement;
        const button = host.querySelector<HTMLButtonElement>('[aria-pressed]')!;
        expect(button.getAttribute('aria-pressed')).toBe('false');
        button.click();
        fixture.detectChanges();
        expect(button.getAttribute('aria-pressed')).toBe('true');
        expect(host.querySelector('.selection-example')?.classList.contains('selected')).toBe(true);
        expect(host.querySelector('[role="status"]')?.textContent).toContain('Selected');
        button.click();
        fixture.detectChanges();
        expect(host.querySelector('[role="status"]')?.textContent).toContain('Not selected');
    });

    it('preserves disabled controls and explicit input labels', () => {
        const fixture = TestBed.createComponent(VisualFoundationsComponent);
        fixture.detectChanges();
        const host: HTMLElement = fixture.nativeElement;
        expect(host.querySelector<HTMLButtonElement>('button[disabled]')?.disabled).toBe(true);
        expect(host.querySelector('label[for="foundation-label"]')?.textContent?.trim()).toBe('Part label');
        expect(host.querySelector<HTMLInputElement>('#foundation-label')?.value).toBe('DevEnv client');
    });
});
