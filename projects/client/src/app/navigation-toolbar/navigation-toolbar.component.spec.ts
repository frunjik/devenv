import { beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { OverlayContainer } from '@angular/cdk/overlay';
import { NavigationToolbarComponent } from './navigation-toolbar.component';

describe('NavigationToolbarComponent', () => {
    let fixture: ComponentFixture<NavigationToolbarComponent>;
    let overlay: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NavigationToolbarComponent],
            providers: [provideRouter([]), provideNoopAnimations()],
        });
        fixture = TestBed.createComponent(NavigationToolbarComponent);
        fixture.componentInstance.host = 'http://host/';
        fixture.detectChanges();
        overlay = TestBed.inject(OverlayContainer).getContainerElement();
    });

    async function openTools(): Promise<void> {
        fixture.nativeElement.querySelector('.tools-navigation-button').click();
        fixture.detectChanges();
        await fixture.whenStable();
    }

    it('shows the host, seven process links and Tools as the final navigation item', () => {
        expect(fixture.nativeElement.querySelector('.meta-badge').textContent.trim()).toBe('DevEnv');
        expect(fixture.nativeElement.querySelector('.toolbar-brand').textContent.trim()).toBe('http://host/');
        const nav = fixture.nativeElement.querySelector('nav') as HTMLElement;
        expect(Array.from(nav.querySelectorAll('a')).map(link => [link.textContent?.trim(), link.getAttribute('href')]))
            .toEqual([
                ['System plan', '/system-plan'],
                ['Workflow TODO', '/workflow-todo'],
                ['Evaluations', '/workflow-evaluations'],
                ['Terms', '/terms'],
                ['Glossary', '/glossary'],
                ['Diagram', '/diagram'],
                ['Canvas', '/interactive-canvas'],
            ]);
        expect(nav.lastElementChild?.textContent?.trim()).toBe('Tools');
        expect(overlay.querySelector('[role="menu"]')).toBeNull();
    });

    it('opens a dropdown with every supporting route and preserved query parameters', async () => {
        await openTools();
        expect(overlay.querySelector('[role="menu"]')).not.toBeNull();
        expect(Array.from(overlay.querySelectorAll('a')).map(link => link.getAttribute('href'))).toEqual([
            '/browse',
            '/tests',
            '/browse?path=.%2Fprojects%2Fserver%2Fsrc%2Flib&file=',
            '/browse?path=.%2Fprojects%2Fclient%2Fsrc%2Fapp&file=',
            '/browse?path=&file=TODO.md',
            '/browse?path=%2Fprojects%2Fclient%2Fsrc%2Fapp&file=%2Fprojects%2Fclient%2Fsrc%2Fapp%2Fnavigation-toolbar%2Fnavigation-toolbar.component.html',
            '/git/log',
        ]);
    });

    it('requests a DevEnv clone from the dropdown', async () => {
        let requested = 0;
        fixture.componentInstance.cloneRequested.subscribe(() => requested++);
        await openTools();
        (overlay.querySelector('.clone-button') as HTMLButtonElement).click();
        expect(requested).toBe(1);
    });

    it('requests a commit and reflects the committing state in the dropdown', async () => {
        let requested = 0;
        fixture.componentInstance.commitRequested.subscribe(() => requested++);
        await openTools();
        const button = overlay.querySelector('.commit-button') as HTMLButtonElement;
        expect(button.disabled).toBe(false);
        button.click();
        expect(requested).toBe(1);
        fixture.componentInstance.isCommitting = true;
        fixture.detectChanges();
        await fixture.whenStable();
        await openTools();
        const disabledButton = overlay.querySelector('.commit-button') as HTMLButtonElement;
        expect(disabledButton.disabled).toBe(true);
        expect(disabledButton.textContent).toContain('Committing');
        disabledButton.click();
        expect(requested).toBe(1);
    });
});
