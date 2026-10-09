import { validateDiagramDocument } from '@shared';
import type { DiagramDocument, DiagramElementKind, DiagramPoint } from '@shared';

function requireDiagramElementIndex(
    document: DiagramDocument,
    elementId: string,
    elementName = 'element',
): number {
    const elementIndex = document.elements.findIndex(element => element.id === elementId);
    if (elementIndex < 0) {
        throw new Error(`Invalid Diagram: ${elementName} "${elementId}" does not exist`);
    }
    return elementIndex;
}

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
    const elementIndex = requireDiagramElementIndex(document, elementId);
    const elements = document.elements.map((element, index) => index === elementIndex
        ? { ...element, position }
        : element);
    return validateDiagramDocument({ ...document, elements });
}

export function editDiagramElementLabel(
    document: DiagramDocument,
    elementId: string,
    label: string,
): DiagramDocument {
    const elementIndex = requireDiagramElementIndex(document, elementId);
    const elements = document.elements.map((element, index) => index === elementIndex
        ? { ...element, label }
        : element);
    return validateDiagramDocument({ ...document, elements });
}

export function editDiagramNoteText(
    document: DiagramDocument,
    elementId: string,
    text: string,
): DiagramDocument {
    const elementIndex = requireDiagramElementIndex(document, elementId, 'Note');
    const element = document.elements[elementIndex];
    if (element.kind !== 'note') {
        throw new Error(`Invalid Diagram: Note "${elementId}" does not exist`);
    }
    const elements = document.elements.map((candidate, index) => index === elementIndex
        ? { ...element, text }
        : candidate);
    return validateDiagramDocument({ ...document, elements });
}

export function connectDiagramElements(
    document: DiagramDocument,
    connectionId: string,
    sourceElementId: string,
    targetElementId: string,
    label: string,
): DiagramDocument {
    return validateDiagramDocument({
        ...document,
        connections: [...document.connections, {
            id: connectionId, sourceElementId, targetElementId, label,
        }],
    });
}
