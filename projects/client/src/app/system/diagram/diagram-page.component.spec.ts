import { beforeEach, describe, expect, it } from '@jest/globals';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import type { CdkDragDrop } from '@angular/cdk/drag-drop';
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
        { kind: 'rectangle', buttonLabel: 'Add Rectangle' },
        { kind: 'ellipse', buttonLabel: 'Add Ellipse' },
        { kind: 'note', buttonLabel: 'Add Note' },
    ])('adds a $kind to the workspace from its palette button', ({ kind, buttonLabel }) => {
        const button = element.querySelector(`button[aria-label="${buttonLabel}"]`) as HTMLButtonElement;

        expect(button).not.toBeNull();
        button.click();
        fixture.detectChanges();

        const item = element.querySelector(`[data-kind="${kind}"]`);
        expect(item).not.toBeNull();
        expect(item?.textContent?.trim()).toBe(kind);
        expect(element.textContent).not.toContain('No items yet');
    });

    it('selects a workspace item when activated', () => {
        element.querySelector<HTMLButtonElement>('button[aria-label="Add Rectangle"]')?.click();
        fixture.detectChanges();

        const item = element.querySelector<HTMLElement>('[data-kind="rectangle"]') as HTMLElement;
        item.click();
        fixture.detectChanges();

        expect(item.getAttribute('aria-pressed')).toBe('true');
    });

    it('persists dragged workspace coordinates with workspace offset and scroll', () => {
        element.querySelector<HTMLButtonElement>('button[aria-label="Add Rectangle"]')?.click();
        fixture.detectChanges();

        const workspace = element.querySelector('[aria-label="Diagram workspace"]') as HTMLElement;
        workspace.scrollLeft = 40;
        workspace.scrollTop = 60;
        const workspaceBounds: DOMRect = {
            x: 100, y: 200, left: 100, top: 200, right: 600, bottom: 600, width: 500, height: 400,
            toJSON: () => ({}),
        };
        const item = element.querySelector('[data-element-id="diagram-element-1"]') as HTMLElement;
        const itemBounds: DOMRect = {
            x: 0, y: 0, left: 0, top: 0, right: 144, bottom: 64, width: 144, height: 64,
            toJSON: () => ({}),
        };
        jest.spyOn(workspace, 'getBoundingClientRect').mockReturnValue(workspaceBounds);
        jest.spyOn(item, 'getBoundingClientRect').mockReturnValue(itemBounds);
        const drag = fixture.debugElement.query(By.css('[data-element-id="diagram-element-1"]'))
            .injector.get(CdkDrag, null);
        expect(drag).not.toBeNull();
        if (!drag) {
            return;
        }
        drag.started.emit({
            source: drag,
            event: new MouseEvent('mousedown', { clientX: 10, clientY: 15 }),
        });

        const workspaceList = fixture.debugElement.queryAll(By.directive(CdkDropList))
            .map(debugElement => debugElement.injector.get(CdkDropList))
            .find(dropList => dropList.id === 'workspace');
        expect(workspaceList).toBeDefined();
        workspaceList?.dropped.emit({
            item: drag,
            currentIndex: 0,
            previousIndex: 0,
            container: workspaceList,
            previousContainer: workspaceList,
            isPointerOverContainer: true,
            distance: { x: 170, y: 285 },
            dropPoint: { x: 180, y: 300 },
            event: new MouseEvent('mouseup'),
        });
        fixture.detectChanges();

        expect(item.style.left).toBe('110px');
        expect(item.style.top).toBe('145px');
    });

    it.each([
        { touches: [{ clientX: 10, clientY: 15 }], changedTouches: [] },
        { touches: [], changedTouches: [{ clientX: 10, clientY: 15 }] },
    ])('persists workspace drags that start with touch coordinates', ({ touches, changedTouches }) => {
        element.querySelector<HTMLButtonElement>('button[aria-label="Add Rectangle"]')?.click();
        fixture.detectChanges();

        const workspace = element.querySelector('[aria-label="Diagram workspace"]') as HTMLElement;
        workspace.scrollLeft = 40;
        workspace.scrollTop = 60;
        const workspaceBounds: DOMRect = {
            x: 100, y: 200, left: 100, top: 200, right: 600, bottom: 600, width: 500, height: 400,
            toJSON: () => ({}),
        };
        const item = element.querySelector('[data-element-id="diagram-element-1"]') as HTMLElement;
        jest.spyOn(workspace, 'getBoundingClientRect').mockReturnValue(workspaceBounds);
        jest.spyOn(item, 'getBoundingClientRect').mockReturnValue({
            x: 0, y: 0, left: 0, top: 0, right: 144, bottom: 64, width: 144, height: 64,
            toJSON: () => ({}),
        });
        const drag = fixture.debugElement.query(By.css('[data-element-id="diagram-element-1"]'))
            .injector.get(CdkDrag);
        const touchEvent = new Event('touchstart');
        Object.defineProperties(touchEvent, {
            touches: { value: touches },
            changedTouches: { value: changedTouches },
        });
        drag.started.emit({ source: drag, event: touchEvent as TouchEvent });
        const workspaceList = fixture.debugElement.queryAll(By.directive(CdkDropList))
            .map(debugElement => debugElement.injector.get(CdkDropList))
            .find(dropList => dropList.id === 'workspace');
        workspaceList?.dropped.emit({
            item: drag,
            currentIndex: 0,
            previousIndex: 0,
            container: workspaceList,
            previousContainer: workspaceList,
            isPointerOverContainer: true,
            distance: { x: 170, y: 285 },
            dropPoint: { x: 180, y: 300 },
            event: new MouseEvent('mouseup'),
        });
        fixture.detectChanges();

        expect(item.style.left).toBe('110px');
        expect(item.style.top).toBe('145px');
    });

    it('reports a touch drag start without a pointer position', () => {
        const drag = fixture.debugElement.query(By.directive(CdkDrag)).injector.get(CdkDrag);
        const touchEvent = new Event('touchstart');
        Object.defineProperties(touchEvent, {
            touches: { value: [] },
            changedTouches: { value: [] },
        });

        expect(() => fixture.componentInstance.startWorkspaceElementDrag({
            source: drag,
            event: touchEvent as TouchEvent,
        })).toThrow('Invalid Diagram drag: pointer position is unavailable');
    });

    it.each([
        ['unsupported source', 'other', 'rectangle', 'Invalid Diagram drag: unsupported source "other"'],
        ['unsupported palette item', 'palette', 'unknown', 'Invalid Diagram drag: unsupported palette item'],
        ['non-string workspace ID', 'workspace', 42, 'Invalid Diagram drag: expected a workspace item ID'],
        ['workspace drag without a start event', 'workspace', 'diagram-element-1', 'Invalid Diagram drag: workspace item was not started'],
    ])('rejects a drag with %s', (_description, sourceId, data, message) => {
        element.querySelector<HTMLButtonElement>('button[aria-label="Add Rectangle"]')?.click();
        fixture.detectChanges();
        const lists = fixture.debugElement.queryAll(By.directive(CdkDropList))
            .map(debugElement => debugElement.injector.get(CdkDropList));
        const paletteList = lists.find(dropList => dropList.id === 'palette');
        const workspaceList = lists.find(dropList => dropList.id === 'workspace');
        const paletteDrag = fixture.debugElement.query(By.css('.drag-handle')).injector.get(CdkDrag);
        const workspaceDrag = fixture.debugElement.query(By.css('[data-element-id="diagram-element-1"]'))
            .injector.get(CdkDrag);
        const source = sourceId === 'workspace' ? workspaceList : paletteList;
        const draggedItem = sourceId === 'workspace' ? workspaceDrag : paletteDrag;
        if (sourceId === 'other') {
            if (paletteList) {
                paletteList.id = 'other';
            }
        } else {
            draggedItem.data = data;
        }
        const drop = {
            item: draggedItem,
            currentIndex: 0,
            previousIndex: 0,
            container: workspaceList,
            previousContainer: source,
            isPointerOverContainer: true,
            distance: { x: 0, y: 0 },
            dropPoint: { x: 0, y: 0 },
            event: new MouseEvent('mouseup'),
        } as CdkDragDrop<unknown, unknown, unknown>;

        expect(() => fixture.componentInstance.dropWorkspaceItem(drop)).toThrow(message);
    });

    it.each(['rectangle', 'ellipse', 'note'] as const)('creates a dragged %s from a valid palette kind', kind => {
        const lists = fixture.debugElement.queryAll(By.directive(CdkDropList))
            .map(debugElement => debugElement.injector.get(CdkDropList));
        const paletteList = lists.find(dropList => dropList.id === 'palette');
        const workspaceList = lists.find(dropList => dropList.id === 'workspace');
        const drag = fixture.debugElement.queryAll(By.directive(CdkDrag))
            .map(debugElement => debugElement.injector.get(CdkDrag))
            .find(candidate => candidate.data === kind);
        if (!drag || !paletteList || !workspaceList) {
            throw new Error('Diagram palette or workspace drag source is unavailable');
        }
        workspaceList.dropped.emit({
            item: drag,
            currentIndex: 0,
            previousIndex: 0,
            container: workspaceList,
            previousContainer: paletteList,
            isPointerOverContainer: true,
            distance: { x: 0, y: 0 },
            dropPoint: { x: 10, y: 20 },
            event: new MouseEvent('mouseup'),
        });
        fixture.detectChanges();

        expect(element.querySelector(`[data-kind="${kind}"]`)).not.toBeNull();
    });

    it('does not reuse a canceled workspace drag offset when adding from the palette', () => {
        element.querySelector<HTMLButtonElement>('button[aria-label="Add Rectangle"]')?.click();
        fixture.detectChanges();

        const workspace = element.querySelector('[aria-label="Diagram workspace"]') as HTMLElement;
        workspace.scrollLeft = 40;
        workspace.scrollTop = 60;
        const workspaceBounds: DOMRect = {
            x: 100, y: 200, left: 100, top: 200, right: 600, bottom: 600, width: 500, height: 400,
            toJSON: () => ({}),
        };
        const workspaceItem = element.querySelector('[data-element-id="diagram-element-1"]') as HTMLElement;
        jest.spyOn(workspace, 'getBoundingClientRect').mockReturnValue(workspaceBounds);
        jest.spyOn(workspaceItem, 'getBoundingClientRect').mockReturnValue({
            x: 0, y: 0, left: 0, top: 0, right: 144, bottom: 64, width: 144, height: 64,
            toJSON: () => ({}),
        });
        const drags = fixture.debugElement.queryAll(By.directive(CdkDrag))
            .map(debugElement => debugElement.injector.get(CdkDrag));
        const workspaceDrag = fixture.debugElement.query(By.css('[data-element-id="diagram-element-1"]'))
            .injector.get(CdkDrag);
        workspaceDrag.started.emit({
            source: workspaceDrag,
            event: new MouseEvent('mousedown', { clientX: 30, clientY: 40 }),
        });

        const [paletteList, workspaceList] = fixture.debugElement
            .queryAll(By.directive(CdkDropList))
            .map(debugElement => debugElement.injector.get(CdkDropList));
        workspaceList.dropped.emit({
            item: drags[0],
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

        const addedItem = element.querySelector('[data-element-id="diagram-element-2"]') as HTMLElement;
        expect(addedItem.style.left).toBe('110px');
        expect(addedItem.style.top).toBe('150px');
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
