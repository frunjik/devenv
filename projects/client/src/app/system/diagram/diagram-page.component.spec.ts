import { beforeEach, describe, expect, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiagramPageComponent } from './diagram-page.component';

describe('DiagramPageComponent', () => {
    let fixture: ComponentFixture<DiagramPageComponent>;
    let element: HTMLElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DiagramPageComponent],
        }).compileComponents();
        fixture = TestBed.createComponent(DiagramPageComponent);
        fixture.detectChanges();
        element = fixture.nativeElement as HTMLElement;
    });

    it('titles the page as the diagram editor', () => {
        expect(element.querySelector('h1')?.textContent?.trim()).toBe('Diagram');
    });

    it('offers an empty, labelled workspace with no items', () => {
        const workspace = element.querySelector('[aria-label="Diagram workspace"]') as HTMLElement;

        expect(workspace).not.toBeNull();
        expect(workspace.children.length).toBe(0);
        expect(element.textContent).toContain('No items yet');
    });
});
