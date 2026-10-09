import { describe, expect, it } from '@jest/globals';
import { validateDiagramDocument, type DiagramDocument } from '@shared';
import {
    createDiagramElement,
    editDiagramElementLabel,
    editDiagramNoteText,
    connectDiagramElements,
    editDiagramConnectionLabel,
    deleteDiagramElement,
    clearDiagramDocument,
    moveDiagramElement,
} from './diagram-operations';

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

describe('Editing diagram element labels', () => {
    const document: DiagramDocument = {
        schemaVersion: 1,
        title: 'DevEnv overview',
        elements: [
            { id: 'r', kind: 'rectangle', label: 'Problem', position: { x: 10, y: 20 } },
            { id: 'n', kind: 'note', label: 'Reminder', text: 'Explore', position: { x: 80, y: 30 } },
        ],
        connections: [{ id: 'c', sourceElementId: 'r', targetElementId: 'n', label: 'Inquiry' }],
    };

    it.each(['r', 'n'])('edits the label for element %s while preserving its other fields', elementId => {
        const before = JSON.stringify(document);
        const result = editDiagramElementLabel(document, elementId, 'Updated label');

        expect(result.elements.find(element => element.id === elementId)?.label).toBe('Updated label');
        expect(result.title).toBe(document.title);
        expect(result.connections).toEqual(document.connections);
        expect(result).not.toBe(document);
        expect(JSON.stringify(document)).toBe(before);
    });

    it('allows an empty label', () => {
        expect(editDiagramElementLabel(document, 'r', '').elements[0].label).toBe('');
    });

    it('rejects a missing element ID without changing the document', () => {
        const before = JSON.stringify(document);

        expect(() => editDiagramElementLabel(document, 'missing', 'Updated'))
            .toThrow('Invalid Diagram');
        expect(JSON.stringify(document)).toBe(before);
    });
});

describe('Editing diagram Note text', () => {
    const document: DiagramDocument = {
        schemaVersion: 1,
        title: 'DevEnv overview',
        elements: [
            { id: 'r', kind: 'rectangle', label: 'Problem', position: { x: 10, y: 20 } },
            { id: 'n', kind: 'note', label: 'Reminder', text: 'Explore', position: { x: 80, y: 30 } },
        ],
        connections: [{ id: 'c', sourceElementId: 'r', targetElementId: 'n', label: 'Inquiry' }],
    };

    it('edits only the selected Note text and preserves the original document', () => {
        const before = JSON.stringify(document);
        const result = editDiagramNoteText(document, 'n', 'Keep the meaning exploratory.');

        expect(result.elements[1]).toEqual({
            ...document.elements[1], text: 'Keep the meaning exploratory.',
        });
        expect(result.elements[0]).toEqual(document.elements[0]);
        expect(result.connections).toEqual(document.connections);
        expect(JSON.stringify(document)).toBe(before);
    });

    it('allows empty Note text', () => {
        const result = editDiagramNoteText(document, 'n', '');

        expect(result.elements[1]).toMatchObject({ kind: 'note', text: '' });
    });

    it.each(['r', 'missing'])('rejects text editing for element %s without changing the document', elementId => {
        const before = JSON.stringify(document);

        expect(() => editDiagramNoteText(document, elementId, 'Text'))
            .toThrow('Invalid Diagram');
        expect(JSON.stringify(document)).toBe(before);
    });
});

describe('Connecting diagram elements', () => {
    const document: DiagramDocument = {
        schemaVersion: 1,
        title: 'DevEnv overview',
        elements: [
            { id: 'r', kind: 'rectangle', label: 'Problem', position: { x: 10, y: 20 } },
            { id: 'e', kind: 'ellipse', label: 'Inquiry', position: { x: 80, y: 30 } },
            { id: 'n', kind: 'note', label: 'Reminder', text: 'Explore', position: { x: 40, y: 80 } },
        ],
        connections: [],
    };

    it('adds a selectable undirected connection without mutating the original', () => {
        const before = JSON.stringify(document);
        const result = connectDiagramElements(document, 'connection-1', 'r', 'e', 'relates to');

        expect(result.connections).toEqual([{
            id: 'connection-1', sourceElementId: 'r', targetElementId: 'e', label: 'relates to',
        }]);
        expect(result.elements).toEqual(document.elements);
        expect(JSON.stringify(document)).toBe(before);
    });

    it.each([
        ['', 'r', 'e'], ['  ', 'r', 'e'], ['r', 'r', 'e'],
    ])('rejects invalid or duplicate connection ID %p without mutation', (id, source, target) => {
        const existing = id === 'r'
            ? { ...document, connections: [{ id: 'r', sourceElementId: 'r', targetElementId: 'e', label: '' }] }
            : document;
        const before = JSON.stringify(existing);
        expect(() => connectDiagramElements(existing, id, source, target, ''))
            .toThrow('Invalid Diagram');
        expect(JSON.stringify(existing)).toBe(before);
    });

    it('rejects missing endpoints and self-connections without mutation', () => {
        const before = JSON.stringify(document);
        expect(() => connectDiagramElements(document, 'c1', 'missing', 'e', '')).toThrow('Invalid Diagram');
        expect(() => connectDiagramElements(document, 'c2', 'r', 'missing', '')).toThrow('Invalid Diagram');
        expect(() => connectDiagramElements(document, 'c3', 'r', 'r', '')).toThrow('Invalid Diagram');
        expect(JSON.stringify(document)).toBe(before);
    });

    it('rejects an existing undirected pair in either endpoint order', () => {
        const connected = connectDiagramElements(document, 'c1', 'r', 'e', '');
        const before = JSON.stringify(connected);

        expect(() => connectDiagramElements(connected, 'c2', 'r', 'e', 'again')).toThrow('Invalid Diagram');
        expect(() => connectDiagramElements(connected, 'c3', 'e', 'r', 'reverse')).toThrow('Invalid Diagram');
        expect(JSON.stringify(connected)).toBe(before);
    });
});

describe('Editing diagram connection labels', () => {
    const document: DiagramDocument = {
        schemaVersion: 1,
        title: 'DevEnv overview',
        elements: [
            { id: 'r', kind: 'rectangle', label: 'Problem', position: { x: 10, y: 20 } },
            { id: 'e', kind: 'ellipse', label: 'Inquiry', position: { x: 80, y: 30 } },
            { id: 'n', kind: 'note', label: 'Reminder', text: 'Explore', position: { x: 40, y: 80 } },
        ],
        connections: [
            { id: 'c', sourceElementId: 'r', targetElementId: 'e', label: 'relates to' },
            { id: 'other', sourceElementId: 'e', targetElementId: 'n', label: 'explores' },
        ],
    };

    it('edits the selected connection label without mutating the original', () => {
        const before = JSON.stringify(document);

        const result = editDiagramConnectionLabel(document, 'c', 'leads to');

        expect(result.connections).toEqual([
            { ...document.connections[0], label: 'leads to' },
            document.connections[1],
        ]);
        expect(result.elements).toEqual(document.elements);
        expect(JSON.stringify(document)).toBe(before);
    });

    it('rejects a missing connection ID without changing the document', () => {
        const before = JSON.stringify(document);

        expect(() => editDiagramConnectionLabel(document, 'missing', 'leads to')).toThrow('Invalid Diagram');
        expect(JSON.stringify(document)).toBe(before);
    });
});

describe('Deleting diagram elements', () => {
    const document: DiagramDocument = {
        schemaVersion: 1,
        title: 'DevEnv overview',
        elements: [
            { id: 'r', kind: 'rectangle', label: 'Problem', position: { x: 10, y: 20 } },
            { id: 'e', kind: 'ellipse', label: 'Inquiry', position: { x: 80, y: 30 } },
            { id: 'n', kind: 'note', label: 'Reminder', text: 'Explore', position: { x: 40, y: 80 } },
        ],
        connections: [
            { id: 'c1', sourceElementId: 'r', targetElementId: 'e', label: 'relates to' },
            { id: 'c2', sourceElementId: 'r', targetElementId: 'n', label: 'explores' },
            { id: 'c3', sourceElementId: 'e', targetElementId: 'n', label: 'continues' },
        ],
    };

    it('deletes the selected element and its attached connections without mutating the original', () => {
        const before = JSON.stringify(document);

        const result = deleteDiagramElement(document, 'r');

        expect(result.elements).toEqual(document.elements.slice(1));
        expect(result.connections).toEqual([document.connections[2]]);
        expect(result.title).toBe(document.title);
        expect(JSON.stringify(document)).toBe(before);
    });

    it('rejects a missing element ID without changing the document', () => {
        const before = JSON.stringify(document);

        expect(() => deleteDiagramElement(document, 'missing')).toThrow('Invalid Diagram');
        expect(JSON.stringify(document)).toBe(before);
    });
});

describe('Clearing a diagram document', () => {
    const document: DiagramDocument = {
        schemaVersion: 1,
        title: 'DevEnv overview',
        elements: [
            { id: 'r', kind: 'rectangle', label: 'Problem', position: { x: 10, y: 20 } },
            { id: 'e', kind: 'ellipse', label: 'Inquiry', position: { x: 80, y: 30 } },
        ],
        connections: [{ id: 'c', sourceElementId: 'r', targetElementId: 'e', label: 'relates to' }],
    };

    it('removes all elements and connections while preserving metadata and source data', () => {
        const before = JSON.stringify(document);

        const result = clearDiagramDocument(document);

        expect(result).toEqual({
            schemaVersion: document.schemaVersion,
            title: document.title,
            elements: [],
            connections: [],
        });
        expect(result).not.toBe(document);
        expect(result.elements).not.toBe(document.elements);
        expect(result.connections).not.toBe(document.connections);
        expect(JSON.stringify(document)).toBe(before);
    });
});
