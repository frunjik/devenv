import { beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NavigationToolbarComponent } from './navigation-toolbar.component';

describe('NavigationToolbarComponent', () => {
    let fixture: ComponentFixture<NavigationToolbarComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NavigationToolbarComponent],
            providers: [provideRouter([])],
        });
        fixture = TestBed.createComponent(NavigationToolbarComponent);
        fixture.componentInstance.host = 'http://host/';
        fixture.detectChanges();
    });

    it('shows the host and only host-level links', () => {
        const text = fixture.nativeElement.textContent as string;

        expect(fixture.nativeElement.querySelector('.meta-badge').textContent.trim()).toBe('DevEnv');
        expect(fixture.nativeElement.querySelector('.toolbar-brand').textContent.trim()).toBe('http://host/');
        expect(text).not.toContain('Meta');
        expect(text).toContain('glossary');
        expect(fixture.nativeElement.querySelector('a[href="/workflow-todo"]').textContent.trim()).toBe('Workflow TODO');
        expect(fixture.nativeElement.querySelector('a[href="/workflow-evaluations"]').textContent.trim())
            .toBe('Evaluations');
        expect(fixture.nativeElement.querySelector('a[href="/browse?path=&file=TODO.md"]')).not.toBeNull();
        const systemPlanLink = fixture.nativeElement.querySelector('a[href="/system-plan"]') as HTMLAnchorElement;
        expect(systemPlanLink).not.toBeNull();
        expect(systemPlanLink.textContent?.trim()).toBe('System plan');
    });

    it('links to the diagram page from the secondary navigation', () => {
        const link = fixture.nativeElement.querySelector('#secondary-navigation a[href="/diagram"]') as HTMLAnchorElement;

        expect(link).not.toBeNull();
        expect(link.textContent?.trim()).toBe('Diagram');
    });

    it('expands and collapses secondary navigation on demand', () => {
        const button = fixture.nativeElement.querySelector('.more-navigation-button') as HTMLButtonElement;
        const secondaryNavigation = fixture.nativeElement.querySelector('#secondary-navigation') as HTMLElement;

        expect(button.getAttribute('aria-expanded')).toBe('false');
        expect(secondaryNavigation.classList.contains('is-expanded')).toBe(false);

        button.click();
        fixture.detectChanges();

        expect(button.getAttribute('aria-expanded')).toBe('true');
        expect(secondaryNavigation.classList.contains('is-expanded')).toBe(true);

        button.click();
        fixture.detectChanges();

        expect(button.getAttribute('aria-expanded')).toBe('false');
        expect(secondaryNavigation.classList.contains('is-expanded')).toBe(false);
    });

    it('requests a DevEnv clone from the host application', () => {
        let requested = 0;
        fixture.componentInstance.cloneRequested.subscribe(() => requested++);
        const button = fixture.nativeElement.querySelector('.clone-button') as HTMLButtonElement;

        button.click();

        expect(requested).toBe(1);
    });

    it('requests a commit and reflects the committing state', () => {
        let requested = 0;
        fixture.componentInstance.commitRequested.subscribe(() => requested++);
        const button = fixture.nativeElement.querySelector('.commit-button') as HTMLButtonElement;

        button.click();
        expect(requested).toBe(1);
        expect(button.disabled).toBe(false);

        fixture.componentInstance.isCommitting = true;
        fixture.detectChanges();

        expect(button.disabled).toBe(true);
        expect(button.textContent).toContain('Committing');
    });
});
