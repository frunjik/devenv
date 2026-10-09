import { validateDiagramDocument } from '@shared';
import type { DiagramDocument, DiagramElementKind, DiagramPoint } from '@shared';

export function createDiagramElement(
    document: DiagramDocument,
    kind: DiagramElementKind,
    id: string,
    position: DiagramPoint,
): DiagramDocument {
    const element = kind === 'note'
        ? { id, kind, label: '', text: '', position }
        : { id, kind, label: '', position };
    return validateDiagramDocument({
        ...document,
        elements: [...document.elements, element],
    });
}

export function moveDiagramElement(
    document: DiagramDocument,
    elementId: string,
    position: DiagramPoint,
): DiagramDocument {
    const elementIndex = document.elements.findIndex(element => element.id === elementId);
    if (elementIndex < 0) {
        throw new Error(`Invalid Diagram: element "${elementId}" does not exist`);
    }
    const elements = document.elements.map((element, index) => index === elementIndex
        ? { ...element, position }
        : element);
    return validateDiagramDocument({ ...document, elements });
}
