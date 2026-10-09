import { beforeEach, describe, expect, it } from '@jest/globals';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
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

    it.each([
        ['rectangle', 'Add Rectangle'],
        ['ellipse', 'Add Ellipse'],
        ['note', 'Add Note'],
    ] as const)('adds a %s to the workspace from its palette button', (kind, buttonLabel) => {
        const button = element.querySelector(`button[aria-label="${buttonLabel}"]`) as HTMLButtonElement;

        expect(button).not.toBeNull();
        button.click();
        fixture.detectChanges();

        const item = element.querySelector(`[data-kind="${kind}"]`);
        expect(item).not.toBeNull();
        expect(item?.textContent?.trim()).toBe(kind);
        expect(element.textContent).not.toContain('No items yet');
    });

    it('creates a dragged item at the drop point in scrolled workspace coordinates', () => {
        const workspace = element.querySelector('[aria-label="Diagram workspace"]') as HTMLElement;
        workspace.scrollLeft = 40;
        workspace.scrollTop = 60;
        const bounds: DOMRect = {
            x: 100, y: 200, left: 100, top: 200, right: 600, bottom: 600, width: 500, height: 400,
            toJSON: () => ({}),
        };
        jest.spyOn(workspace, 'getBoundingClientRect').mockReturnValue(bounds);

        const [paletteList, workspaceList] = fixture.debugElement
            .queryAll(By.directive(CdkDropList))
            .map(debugElement => debugElement.injector.get(CdkDropList));
        const draggedItem = fixture.debugElement.query(By.directive(CdkDrag))
            .injector.get(CdkDrag);

        workspaceList.dropped.emit({
            item: draggedItem,
            currentIndex: 0,
            previousIndex: 0,
            container: workspaceList,
            previousContainer: paletteList,
            isPointerOverContainer: true,
            distance: { x: 70, y: 90 },
            dropPoint: { x: 170, y: 290 },
            event: new MouseEvent('mouseup'),
        });
        fixture.detectChanges();

        const item = element.querySelector('[data-kind="rectangle"]') as HTMLElement;
        expect(item.style.left).toBe('110px');
        expect(item.style.top).toBe('150px');
    });
});
