import { validateDiagramDocument } from '@shared';
import type { DiagramDocument, DiagramElement, DiagramElementKind, DiagramPoint } from '@shared';

function requireDiagramElement(
    document: DiagramDocument,
    elementId: string,
    elementName = 'element',
): DiagramElement {
    const element = document.elements.find(candidate => candidate.id === elementId);
    if (!element) {
        throw new Error(`Invalid Diagram: ${elementName} "${elementId}" does not exist`);
    }
    return element;
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
    const selectedElement = requireDiagramElement(document, elementId);
    const elements = document.elements.map(element => element === selectedElement
        ? { ...selectedElement, position }
        : element);
    return validateDiagramDocument({ ...document, elements });
}

export function editDiagramElementLabel(
    document: DiagramDocument,
    elementId: string,
    label: string,
): DiagramDocument {
    const selectedElement = requireDiagramElement(document, elementId);
    const elements = document.elements.map(element => element === selectedElement
        ? { ...selectedElement, label }
        : element);
    return validateDiagramDocument({ ...document, elements });
}

export function editDiagramNoteText(
    document: DiagramDocument,
    elementId: string,
    text: string,
): DiagramDocument {
    const element = requireDiagramElement(document, elementId, 'Note');
    if (element.kind !== 'note') {
        throw new Error(`Invalid Diagram: Note "${elementId}" does not exist`);
    }
    const elements = document.elements.map(candidate => candidate === element
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

export function editDiagramConnectionLabel(
    document: DiagramDocument,
    connectionId: string,
    label: string,
): DiagramDocument {
    const connectionIndex = document.connections.findIndex(connection => connection.id === connectionId);
    if (connectionIndex < 0) {
        throw new Error(`Invalid Diagram: connection "${connectionId}" does not exist`);
    }
    const connections = document.connections.map((connection, index) => index === connectionIndex
        ? { ...connection, label }
        : connection);
    return validateDiagramDocument({ ...document, connections });
}

export function deleteDiagramElement(document: DiagramDocument, elementId: string): DiagramDocument {
    const element = requireDiagramElement(document, elementId);
    return validateDiagramDocument({
        ...document,
        elements: document.elements.filter(candidate => candidate !== element),
        connections: document.connections.filter(connection =>
            connection.sourceElementId !== elementId && connection.targetElementId !== elementId),
    });
}
