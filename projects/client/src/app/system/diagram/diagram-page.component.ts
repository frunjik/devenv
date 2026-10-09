import { Component } from '@angular/core';
import { createDiagramElement } from './diagram-operations';
import type { DiagramDocument, DiagramElementKind } from '@shared';

@Component({
    selector: 'app-diagram-page',
    standalone: true,
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
        this.document = createDiagramElement(
            this.document,
            kind,
            `diagram-element-${this.nextElementId++}`,
            { x: index * 24, y: index * 24 },
        );
    }
}
