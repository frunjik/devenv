import { Component } from '@angular/core';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import { createDiagramElement } from './diagram-operations';
import type { DiagramDocument, DiagramElementKind, DiagramPoint } from '@shared';

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

    addElement(kind: DiagramElementKind): void {
        const index = this.document.elements.length;
        this.createElement(kind, { x: index * 24, y: index * 24 });
    }

    dropPaletteElement(event: CdkDragDrop<unknown, unknown, DiagramElementKind>): void {
        const workspace = event.container.element.nativeElement;
        const bounds = workspace.getBoundingClientRect();
        this.createElement(event.item.data, {
            x: event.dropPoint.x - bounds.left + workspace.scrollLeft,
            y: event.dropPoint.y - bounds.top + workspace.scrollTop,
        });
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
