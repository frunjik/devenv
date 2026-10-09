import { Component } from '@angular/core';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import { connectDiagramElements, createDiagramElement, moveDiagramElement } from './diagram-operations';
import type { DiagramConnection, DiagramDocument, DiagramElementKind, DiagramPoint } from '@shared';

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
    private nextConnectionId = 1;
    private dragOffset: DiagramPoint | null = null;
    private connectingSourceElementId: string | null = null;
    selectedElementId: string | null = null;
    selectedConnectionId: string | null = null;

    get isConnecting(): boolean {
        return this.connectingSourceElementId !== null;
    }

    selectElement(elementId: string): void {
        if (this.connectingSourceElementId !== null) {
            if (elementId === this.connectingSourceElementId) {
                return;
            }
            this.document = connectDiagramElements(
                this.document,
                `diagram-connection-${this.nextConnectionId++}`,
                this.connectingSourceElementId,
                elementId,
                '',
            );
            this.connectingSourceElementId = null;
        }
        this.selectedElementId = elementId;
    }

    startConnection(): void {
        if (this.selectedElementId === null) {
            throw new Error('Invalid Diagram connection: select a source item first');
        }
        this.connectingSourceElementId = this.selectedElementId;
    }

    cancelConnection(): void {
        this.connectingSourceElementId = null;
    }

    selectConnection(connectionId: string): void {
        this.selectedConnectionId = connectionId;
        this.selectedElementId = null;
    }

    connectionLine(
        connection: DiagramConnection,
        workspace: HTMLElement,
    ): { x1: number; y1: number; x2: number; y2: number } {
        const items = Array.from(workspace.querySelectorAll<HTMLElement>('[data-element-id]'));
        const source = items.find(item => item.dataset['elementId'] === connection.sourceElementId);
        const target = items.find(item => item.dataset['elementId'] === connection.targetElementId);
        if (!source || !target) {
            throw new Error(`Invalid Diagram connection: endpoint item is unavailable for "${connection.id}"`);
        }
        const workspaceBounds = workspace.getBoundingClientRect();
        const sourceBounds = source.getBoundingClientRect();
        const targetBounds = target.getBoundingClientRect();
        return {
            x1: sourceBounds.left - workspaceBounds.left + workspace.scrollLeft + sourceBounds.width / 2,
            y1: sourceBounds.top - workspaceBounds.top + workspace.scrollTop + sourceBounds.height / 2,
            x2: targetBounds.left - workspaceBounds.left + workspace.scrollLeft + targetBounds.width / 2,
            y2: targetBounds.top - workspaceBounds.top + workspace.scrollTop + targetBounds.height / 2,
        };
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
