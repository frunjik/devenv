export interface DiagramPoint {
    x: number;
    y: number;
}

export interface DiagramRectangleElement {
    id: string;
    kind: 'rectangle';
    label: string;
    position: DiagramPoint;
}

export interface DiagramEllipseElement {
    id: string;
    kind: 'ellipse';
    label: string;
    position: DiagramPoint;
}

export interface DiagramNoteElement {
    id: string;
    kind: 'note';
    label: string;
    text: string;
    position: DiagramPoint;
}

export type DiagramElement = DiagramRectangleElement | DiagramEllipseElement | DiagramNoteElement;
export type DiagramElementKind = DiagramElement['kind'];

export interface DiagramConnection {
    id: string;
    sourceElementId: string;
    targetElementId: string;
    label: string;
}

export interface DiagramDocument {
    schemaVersion: 1;
    title: string;
    elements: DiagramElement[];
    connections: DiagramConnection[];
}

function requireRecord(value: unknown): Record<string, unknown> {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('Invalid Diagram: expected a record');
    }
    return value as Record<string, unknown>;
}

function requireFields(value: Record<string, unknown>, fields: string[]): void {
    if (Object.keys(value).sort().join(',') !== fields.sort().join(',')) {
        throw new Error('Invalid Diagram: missing or unsupported fields');
    }
}

function requireText(value: unknown): string {
    if (typeof value !== 'string') {
        throw new Error('Invalid Diagram: expected text');
    }
    return value;
}

function requireId(value: unknown, ids: Set<string>): string {
    const id = requireText(value);
    if (!id.trim() || ids.has(id)) {
        throw new Error('Invalid Diagram: IDs must be non-empty and unique within their collection');
    }
    ids.add(id);
    return id;
}

function requireCoordinate(value: unknown): number {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
        throw new Error('Invalid Diagram: coordinates must be finite and non-negative');
    }
    return value;
}

function validateDiagramElement(value: unknown, elementIds: Set<string>): DiagramElement {
    const element = requireRecord(value);
    requireFields(element, element['kind'] === 'note'
        ? ['id', 'kind', 'label', 'position', 'text'] : ['id', 'kind', 'label', 'position']);
    const position = requireRecord(element['position']);
    requireFields(position, ['x', 'y']);
    const fields = {
        id: requireId(element['id'], elementIds),
        label: requireText(element['label']),
        position: { x: requireCoordinate(position['x']), y: requireCoordinate(position['y']) },
    };
    if (element['kind'] === 'rectangle' || element['kind'] === 'ellipse') {
        return { ...fields, kind: element['kind'] };
    }
    if (element['kind'] === 'note') {
        return { ...fields, kind: 'note', text: requireText(element['text']) };
    }
    throw new Error('Invalid Diagram: unsupported element kind');
}

function validateDiagramConnections(values: unknown[], elementIds: Set<string>): DiagramConnection[] {
    const connectionIds = new Set<string>();
    const pairs = new Set<string>();
    return values.map((value: unknown): DiagramConnection => {
        const connection = requireRecord(value);
        requireFields(connection, ['id', 'sourceElementId', 'targetElementId', 'label']);
        const id = requireId(connection['id'], connectionIds);
        const sourceElementId = requireText(connection['sourceElementId']);
        const targetElementId = requireText(connection['targetElementId']);
        if (!elementIds.has(sourceElementId) || !elementIds.has(targetElementId)
            || sourceElementId === targetElementId) {
            throw new Error('Invalid Diagram: connections require two distinct existing elements');
        }
        const pair = JSON.stringify([sourceElementId, targetElementId].sort());
        if (pairs.has(pair)) {
            throw new Error('Invalid Diagram: duplicate undirected connection');
        }
        pairs.add(pair);
        return { id, sourceElementId, targetElementId, label: requireText(connection['label']) };
    });
}

export function validateDiagramDocument(value: unknown): DiagramDocument {
    const document = requireRecord(value);
    requireFields(document, ['schemaVersion', 'title', 'elements', 'connections']);
    if (document['schemaVersion'] !== 1
        || !Array.isArray(document['elements']) || !Array.isArray(document['connections'])) {
        throw new Error('Invalid Diagram: expected version 1 and element/connection arrays');
    }
    const title = requireText(document['title']);
    const elementIds = new Set<string>();
    const elements = document['elements'].map((value: unknown) => validateDiagramElement(value, elementIds));
    const connections = validateDiagramConnections(document['connections'], elementIds);
    return { schemaVersion: 1, title, elements, connections };
}
