import { validateDiagramDocument } from '@shared';
import type { DiagramDocument } from '@shared';
import template from './default-template.json';

export type TemplateShape = 'artifact' | 'system-software' | 'business-role' | 'product' | 'actor' | 'tech-process';

export interface DefaultTemplate {
    geometry: DiagramDocument;
    shapes: Record<string, TemplateShape>;
}

export function createDefaultTemplate(value: unknown = template): DefaultTemplate {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('Invalid default template: expected geometry and shapes.');
    }
    const record = value as Record<string, unknown>;
    const geometry = validateDiagramDocument(record['geometry']);
    const shapes = record['shapes'];
    if (!shapes || typeof shapes !== 'object' || Array.isArray(shapes)) {
        throw new Error('Invalid default template: expected a shape map.');
    }
    const entries = Object.entries(shapes);
    if (entries.length !== geometry.elements.length) {
        throw new Error('Invalid default template: every element needs one shape.');
    }
    const validated: Record<string, TemplateShape> = {};
    for (const [id, shape] of entries) {
        if (!geometry.elements.some(element => element.id === id)
            || (shape !== 'artifact' && shape !== 'system-software' && shape !== 'business-role'
                && shape !== 'product' && shape !== 'actor' && shape !== 'tech-process')) {
            throw new Error('Invalid default template: unknown element or unsupported shape.');
        }
        validated[id] = shape;
    }
    return { geometry, shapes: validated };
}
