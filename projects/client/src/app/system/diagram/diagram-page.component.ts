import { Component } from '@angular/core';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import { createDiagramElement, moveDiagramElement } from './diagram-operations';
import type { DiagramDocument, DiagramElementKind, DiagramPoint } from '@shared';

function isDiagramElementKind(value: unknown): value is DiagramElementKind {
    return value === 'rectangle' || value === 'ellipse' || value === 'note';
}

function getPointerPosition(event: MouseEvent | TouchEvent): DiagramPoint {
    if ('clientX' in event) {
        return { x: event.clientX, y: event.clientY };
    }
    const touch = event.touches[0] ?? event.changedTouches[0];
    if (!touch) {
        throw new Error('Invalid Diagram drag: pointer position is unavailable');
    }
    return { x: touch.clientX, y: touch.clientY };
}

function getWorkspaceDropPosition(
    workspace: HTMLElement,
    dropPoint: DiagramPoint,
    dragOffset: DiagramPoint,
): DiagramPoint {
    const bounds = workspace.getBoundingClientRect();
    return {
        x: dropPoint.x - bounds.left + workspace.scrollLeft - dragOffset.x,
        y: dropPoint.y - bounds.top + workspace.scrollTop - dragOffset.y,
    };
}

@Component({
    selector: 'app-diagram-page',
    standalone: true,
    imports: [CdkDrag, CdkDropList],
    templateUrl: './diagram-page.component.html',
    styleUrl: './diagram-page.component.scss',
})
export class DiagramPageComponent {
    document: DiagramDocument = {
        schemaVersion: 1,
        title: '',
        elements: [],
        connections: [],
    };

    private nextElementId = 1;
    private dragOffset: DiagramPoint | null = null;
    selectedElementId: string | null = null;

    selectElement(elementId: string): void {
        this.selectedElementId = elementId;
    }

    addElement(kind: DiagramElementKind): void {
        const index = this.document.elements.length;
        this.createElement(kind, { x: index * 24, y: index * 24 });
    }

    startWorkspaceElementDrag(event: MouseEvent | TouchEvent): void {
        if (!(event.currentTarget instanceof HTMLElement)) {
            throw new Error('Invalid Diagram drag: workspace item element is unavailable');
        }
        const bounds = event.currentTarget.getBoundingClientRect();
        const pointer = getPointerPosition(event);
        this.dragOffset = {
            x: pointer.x - bounds.left,
            y: pointer.y - bounds.top,
        };
    }

    dropWorkspaceItem(event: CdkDragDrop<unknown, unknown, unknown>): void {
        const sourceId = event.previousContainer.id;
        const itemData = event.item.data;
        const workspace = event.container.element.nativeElement;
        if (sourceId === 'palette') {
            if (!isDiagramElementKind(itemData)) {
                throw new Error('Invalid Diagram drag: unsupported palette item');
            }
            this.createElement(itemData, getWorkspaceDropPosition(
                workspace,
                event.dropPoint,
                { x: 0, y: 0 },
            ));
            this.dragOffset = null;
            return;
        }
        if (sourceId !== 'workspace') {
            throw new Error(`Invalid Diagram drag: unsupported source "${sourceId}"`);
        }
        if (typeof itemData !== 'string') {
            throw new Error('Invalid Diagram drag: expected a workspace item ID');
        }
        if (!this.dragOffset) {
            throw new Error('Invalid Diagram drag: workspace item was not started');
        }
        this.document = moveDiagramElement(
            this.document,
            itemData,
            getWorkspaceDropPosition(workspace, event.dropPoint, this.dragOffset),
        );
        this.dragOffset = null;
    }

    private createElement(kind: DiagramElementKind, position: DiagramPoint): void {
        this.document = createDiagramElement(
            this.document,
            kind,
            `diagram-element-${this.nextElementId++}`,
            position,
        );
    }
}
