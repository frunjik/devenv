import { describe, expect, it } from '@jest/globals';
import { validateDiagramDocument, type DiagramDocument } from '@shared';
import { createDiagramElement, moveDiagramElement } from './diagram-operations';

describe('Creating diagram elements', () => {
    it('creates a Rectangle at the supplied position without changing the original document', () => {
        const document: DiagramDocument = { schemaVersion: 1, title: 'DevEnv', elements: [], connections: [] };
        const position = { x: 40, y: 80 };

        const result = createDiagramElement(document, 'rectangle', 'rectangle-1', position);

        expect(result).toEqual({
            ...document,
            elements: [{ id: 'rectangle-1', kind: 'rectangle', label: '', position }],
        });

        expect(document.elements).toEqual([]);
        expect(result).not.toBe(document);
        expect(result.elements[0].position).not.toBe(position);
    });

    it.each(['ellipse', 'note'] as const)('creates a %s with its required fields', kind => {
        const document: DiagramDocument = { schemaVersion: 1, title: '', elements: [], connections: [] };
        const result = createDiagramElement(document, kind, 'new-1', { x: 0, y: 0 });

        expect(result.elements).toEqual([{
            id: 'new-1', kind, label: '', position: { x: 0, y: 0 },
            ...(kind === 'note' ? { text: '' } : {}),
        }]);
        expect(validateDiagramDocument(result)).toEqual(result);
    });

    const existing: DiagramDocument = {
        schemaVersion: 1,
        title: 'DevEnv overview',
        elements: [
            { id: 'r', kind: 'rectangle', label: 'Problem', position: { x: 0, y: 0 } },
            { id: 'n', kind: 'note', label: 'Reminder', text: 'Explore', position: { x: 80, y: 20 } },
        ],
        connections: [{ id: 'c', sourceElementId: 'r', targetElementId: 'n', label: 'Inquiry' }],
    };

    it('appends a fresh instance without sharing mutable records or altering existing content', () => {
        const before = JSON.stringify(existing);
        const first = createDiagramElement(existing, 'rectangle', 'c', { x: 20, y: 40 });
        const second = createDiagramElement(first, 'rectangle', 'second', { x: 20, y: 40 });

        expect(second.elements.slice(0, 2)).toEqual(existing.elements);
        expect(second.elements.map(element => element.id)).toEqual(['r', 'n', 'c', 'second']);
        expect(second.connections).toEqual(existing.connections);
        expect(second.title).toBe(existing.title);
        expect(first.elements).toHaveLength(3);
        expect(JSON.stringify(existing)).toBe(before);
        expect(second.elements[0]).not.toBe(existing.elements[0]);
        expect(second.connections[0]).not.toBe(existing.connections[0]);
    });

    it.each(['', '  ', 'r'])('rejects invalid or duplicate element ID %p without changing the document', id => {
        const before = JSON.stringify(existing);
        expect(() => createDiagramElement(existing, 'rectangle', id, { x: 0, y: 0 }))
            .toThrow('Invalid Diagram');
        expect(JSON.stringify(existing)).toBe(before);
    });

    it.each([
        { x: -1, y: 0 }, { x: 0, y: -1 }, { x: NaN, y: 0 },
        { x: 0, y: Infinity }, { x: -Infinity, y: 0 },
    ])('rejects invalid position %p without changing the document', position => {
        const before = JSON.stringify(existing);
        expect(() => createDiagramElement(existing, 'rectangle', 'new', position))
            .toThrow('Invalid Diagram');
        expect(JSON.stringify(existing)).toBe(before);
    });
});

describe('Moving diagram elements', () => {
    const document: DiagramDocument = {
        schemaVersion: 1,
        title: 'DevEnv overview',
        elements: [
            { id: 'r', kind: 'rectangle', label: 'Problem', position: { x: 10, y: 20 } },
            { id: 'n', kind: 'note', label: 'Reminder', text: 'Explore', position: { x: 80, y: 30 } },
        ],
        connections: [{ id: 'c', sourceElementId: 'r', targetElementId: 'n', label: 'Inquiry' }],
    };

    it('moves the requested element while preserving the rest of the document and source', () => {
        const before = JSON.stringify(document);
        const result = moveDiagramElement(document, 'r', { x: 100, y: 200 });

        expect(result).toEqual({
            ...document,
            elements: [
                { ...document.elements[0], position: { x: 100, y: 200 } },
                document.elements[1],
            ],
        });
        expect(result.connections).toEqual(document.connections);
        expect(result).not.toBe(document);
        expect(result.elements[0]).not.toBe(document.elements[0]);
        expect(result.elements[1]).not.toBe(document.elements[1]);
        expect(JSON.stringify(document)).toBe(before);
    });

    it('rejects a missing element ID without changing the document', () => {
        const before = JSON.stringify(document);

        expect(() => moveDiagramElement(document, 'missing', { x: 1, y: 2 }))
            .toThrow('Invalid Diagram');
        expect(JSON.stringify(document)).toBe(before);
    });

    it.each([
        { x: -1, y: 0 }, { x: 0, y: -1 }, { x: NaN, y: 0 },
        { x: 0, y: Infinity }, { x: -Infinity, y: 0 },
    ])('rejects invalid position %p without changing the document', position => {
        const before = JSON.stringify(document);

        expect(() => moveDiagramElement(document, 'r', position)).toThrow('Invalid Diagram');
        expect(JSON.stringify(document)).toBe(before);
    });
});
