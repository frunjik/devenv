import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { AgentGuideComponent } from './agent-guide.component';

describe('AgentGuideComponent', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AgentGuideComponent],
            providers: [provideNoopAnimations()],
        });
    });
    afterEach(() => { TestBed.resetTestingModule(); });

    it('shows source JSON and a labelled tab for every generated Markdown file', async () => {
        const fixture = TestBed.createComponent(AgentGuideComponent);
        fixture.detectChanges();
        const host: HTMLElement = fixture.nativeElement;
        expect(host.querySelector('h1')?.textContent).toContain('Agent guide');
        expect(host.querySelector('[data-guide-source]')?.textContent).toContain('"commitProcedure"');
        const tabs = [...host.querySelectorAll<HTMLElement>('[role="tab"]')];
        expect(tabs.map(tab => tab.textContent?.trim())).toEqual(
            fixture.componentInstance.preview.files.map(file => file.path),
        );
        expect(host.textContent).toContain('Read-only preview');
        expect(tabs[0].getAttribute('aria-selected')).toBe('true');
        for (const [index, tab] of tabs.entries()) {
            tab.click();
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();
            expect(tab.getAttribute('aria-selected')).toBe('true');
            const panel = host.querySelector<HTMLElement>('[role="tabpanel"]:not([inert])');
            expect(panel?.querySelector('pre')?.textContent).toBe(
                fixture.componentInstance.preview.files[index].content,
            );
            expect(panel?.querySelector('pre')?.getAttribute('tabindex')).toBe('0');
            panel?.querySelector<HTMLButtonElement>('[data-preview-toggle]')?.click();
            fixture.detectChanges();
            expect(panel?.querySelector('app-markdown-preview')).not.toBeNull();
            expect(panel?.querySelector('[data-generated-file]')).toBeNull();
            panel?.querySelector<HTMLButtonElement>('[data-source-toggle]')?.click();
            fixture.detectChanges();
            expect(panel?.querySelector('[data-generated-file]')?.textContent).toBe(
                fixture.componentInstance.preview.files[index].content,
            );
        }
        expect(host.querySelector('[data-guide-source]')?.textContent).toContain('"commitProcedure"');
        expect([...host.querySelectorAll('button')].some(button => /export|activate/i.test(button.textContent ?? ''))).toBe(false);
    });
});
