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
