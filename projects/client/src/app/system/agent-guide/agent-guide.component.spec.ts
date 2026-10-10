import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { AgentGuideComponent } from './agent-guide.component';

describe('AgentGuideComponent', () => {
    beforeEach(() => { TestBed.configureTestingModule({ imports: [AgentGuideComponent] }); });
    afterEach(() => { TestBed.resetTestingModule(); });

    it('shows source JSON and all generated file contents without export or activation controls', () => {
        const fixture = TestBed.createComponent(AgentGuideComponent);
        fixture.detectChanges();
        const host: HTMLElement = fixture.nativeElement;
        expect(host.querySelector('h1')?.textContent).toContain('Agent guide');
        expect(host.querySelector('[data-guide-source]')?.textContent).toContain('"commitProcedure"');
        expect(host.querySelectorAll('[data-generated-file]')).toHaveLength(7);
        expect(host.textContent).toContain('Read-only preview');
        expect(host.querySelector('button')).toBeNull();
        expect(host.querySelectorAll('pre[tabindex="0"]')).toHaveLength(8);
    });
});
