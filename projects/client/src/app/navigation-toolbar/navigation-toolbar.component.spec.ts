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

        expect(text).toContain('DevEnv - http://host/');
        expect(text).toContain('glossary');
        expect(text.toLowerCase()).not.toContain('system plan');
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
