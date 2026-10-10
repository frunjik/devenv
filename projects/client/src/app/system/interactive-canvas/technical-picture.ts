import { validateDiagramDocument } from '@shared';
import type { DiagramConnection, DiagramElement, DiagramPoint } from '@shared';
import architecture from './devenv-c4.json';

interface ArchitectureElement {
    name: string;
    type: string;
    description: string;
    technology?: string;
}

interface ArchitectureRelationship {
    from: string;
    to: string;
    label: string;
    technology?: string;
}

interface ArchitectureGroup {
    title: string;
    elements: string[];
}

interface ArchitectureView {
    title: string;
    relationships: string[];
    groups: ArchitectureGroup[];
    notes: string;
}

interface ArchitectureModel {
    status: string;
    elements: Record<string, ArchitectureElement>;
    relationships: Record<string, ArchitectureRelationship>;
    views: ArchitectureView[];
}

interface PictureGeometry {
    elements: DiagramElement[];
    connections: DiagramConnection[];
}

export interface TechnicalPicture {
    geometry: PictureGeometry;
    elements: Record<string, ArchitectureElement>;
    relationships: Record<string, ArchitectureRelationship>;
    groups: ArchitectureGroup[];
    notes: string;
    labelOffsets: Record<string, DiagramPoint>;
}

const model: ArchitectureModel = architecture;
const positions = {
    user: { x: 40, y: 80 },
    client: { x: 340, y: 80 },
    devserver: { x: 760, y: 80 },
    api: { x: 760, y: 400 },
    tools: { x: 760, y: 720 },
    workspace: { x: 1160, y: 720 },
    tickets: { x: 1160, y: 240 },
    cache: { x: 1160, y: 400 },
    export: { x: 1160, y: 560 },
} satisfies Partial<Record<keyof typeof architecture.elements, DiagramPoint>>;

const labelOffsets = {
    'use-client': { x: 0, y: 88 },
    assets: { x: 0, y: 64 },
    requests: { x: -100, y: 60 },
    resources: { x: 30, y: 48 },
    persistence: { x: 0, y: -64 },
    results: { x: 0, y: -64 },
    execute: { x: -160, y: -24 },
    'tool-files': { x: 0, y: -64 },
    clone: { x: -70, y: 30 },
} satisfies Partial<Record<keyof typeof architecture.relationships, DiagramPoint>>;

export function createTechnicalPicture(): TechnicalPicture {
    const view = model.views.find(candidate => candidate.title === 'Deployment: local development');
    if (!view) {
        throw new Error('Technical picture: local development view is missing.');
    }
    const elements = Object.entries(positions).map(([id, position]) => {
        const element = model.elements[id];
        if (!element) {
            throw new Error(`Technical picture: unknown element ${id}.`);
        }
        return { id, kind: 'rectangle', label: element.name, position };
    });
    const validatedElements = validateDiagramDocument({
        schemaVersion: 1, title: view.title, elements, connections: [],
    }).elements;
    const elementIds = new Set(validatedElements.map(element => element.id));
    const pairs = new Set<string>();
    const connections = view.relationships.map(id => {
        const relationship = model.relationships[id];
        if (!relationship) {
            throw new Error(`Technical picture: unknown relationship ${id}.`);
        }
        if (!elementIds.has(relationship.from) || !elementIds.has(relationship.to)
            || relationship.from === relationship.to) {
            throw new Error(`Technical picture: invalid directed relationship ${id}.`);
        }
        const pair = JSON.stringify([relationship.from, relationship.to]);
        if (pairs.has(pair)) {
            throw new Error(`Technical picture: duplicate directed relationship ${id}.`);
        }
        pairs.add(pair);
        return {
            id, sourceElementId: relationship.from, targetElementId: relationship.to,
            label: relationship.label,
        };
    });
    const groups = view.groups.filter(group => !(group.elements.length === 1 && group.elements[0] === 'user'));
    for (const group of groups) {
        if (!group.elements.length || group.elements.some(id => !elementIds.has(id))) {
            throw new Error(`Technical picture: invalid boundary ${group.title}.`);
        }
    }
    return {
        geometry: { elements: validatedElements, connections },
        elements: model.elements, relationships: model.relationships, groups, labelOffsets,
        notes: `${model.status}. ${view.notes}`,
    };
}
