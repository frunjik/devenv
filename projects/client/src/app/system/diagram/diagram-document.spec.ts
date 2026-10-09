import { describe, expect, it } from '@jest/globals';
import { validateDiagramDocument, type DiagramDocument } from '@shared';

describe('Diagram document contract', () => {
    const rectangle = { id: 'r', kind: 'rectangle', label: '', position: { x: 0, y: 0 } };
    const ellipse = { ...rectangle, id: 'e', kind: 'ellipse' };
    const note = { ...rectangle, id: 'n', kind: 'note', text: '' };
    const connection = { id: 'c', sourceElementId: 'r', targetElementId: 'e', label: '' };
    const valid = { schemaVersion: 1, title: '', elements: [rectangle, ellipse, note], connections: [connection] };

    it('accepts an empty transferable document', () => {
        const document: DiagramDocument = {
            schemaVersion: 1,
            title: '',
            elements: [],
            connections: [],
        };

        expect(validateDiagramDocument(document)).toEqual(document);
    });

    it('preserves all three element kinds and an undirected connection through JSON', () => {
        const document: DiagramDocument = {
            schemaVersion: 1,
            title: 'DevEnv overview',
            elements: [
                { id: 'r', kind: 'rectangle', label: 'Problem', position: { x: 0, y: 20 } },
                { id: 'e', kind: 'ellipse', label: 'Inquiry', position: { x: 100, y: 20 } },
                { id: 'n', kind: 'note', label: '', text: 'Explore, not a formal relationship.', position: { x: 50, y: 80 } },
            ],
            connections: [{ id: 'c', sourceElementId: 'r', targetElementId: 'e', label: '' }],
        };

        expect(validateDiagramDocument(JSON.parse(JSON.stringify(document)))).toEqual(document);
    });

    it.each([null, 42, [], {}, { ...valid, schemaVersion: 2 }, { ...valid, extra: true }])(
        'rejects malformed or unsupported document %p', value => {
            expect(() => validateDiagramDocument(value)).toThrow('Invalid Diagram');
        },
    );

    const records = [
        { name: 'document', record: valid, wrap: (value: unknown) => value },
        { name: 'rectangle', record: rectangle, wrap: (value: unknown) => ({ ...valid, elements: [value] }) },
        { name: 'ellipse', record: ellipse, wrap: (value: unknown) => ({ ...valid, elements: [value] }) },
        { name: 'note', record: note, wrap: (value: unknown) => ({ ...valid, elements: [value] }) },
        { name: 'position', record: rectangle.position, wrap: (value: unknown) => ({
            ...valid, elements: [{ ...rectangle, position: value }],
        }) },
        { name: 'connection', record: connection, wrap: (value: unknown) => ({ ...valid, connections: [value] }) },
    ];

    for (const { name, record, wrap } of records) {
        it.each([null, 42, [], { ...record, extra: true }])(`rejects malformed ${name} %p`, value => {
            expect(() => validateDiagramDocument(wrap(value))).toThrow('Invalid Diagram');
        });
        for (const key of Object.keys(record)) {
            it.each(['missing', 'wrong type'])(`rejects ${name}.${key} when %s`, mode => {
                const candidate: Record<string, unknown> = { ...record };
                if (mode === 'missing') {
                    delete candidate[key];
                } else {
                    candidate[key] = null;
                }
                expect(() => validateDiagramDocument(wrap(candidate))).toThrow('Invalid Diagram');
            });
        }
    }

    it.each([-1, NaN, Infinity, -Infinity])('rejects non-finite or negative coordinate %p', coordinate => {
        for (const axis of ['x', 'y']) {
            expect(() => validateDiagramDocument({
                ...valid, elements: [{ ...rectangle, position: { x: 0, y: 0, [axis]: coordinate } }],
            })).toThrow('Invalid Diagram');
        }
    });

    it.each([
        { ...valid, elements: [{ ...rectangle, kind: 'triangle' }] },
        { ...valid, elements: [{ ...rectangle, text: 'Not a note' }] },
        { ...valid, elements: [{ ...rectangle, id: '' }] },
        { ...valid, elements: [{ ...rectangle, id: '  ' }] },
        { ...valid, elements: [rectangle, rectangle] },
        { ...valid, connections: [{ ...connection, id: '' }] },
        { ...valid, connections: [{ ...connection, id: '  ' }] },
        { ...valid, connections: [connection, { ...connection, sourceElementId: 'n' }] },
        { ...valid, connections: [{ ...connection, sourceElementId: 'missing' }] },
        { ...valid, connections: [{ ...connection, targetElementId: 'missing' }] },
        { ...valid, connections: [{ ...connection, targetElementId: 'r' }] },
        { ...valid, connections: [connection, { ...connection, id: 'second' }] },
        { ...valid, connections: [connection, { ...connection, id: 'reverse', sourceElementId: 'e', targetElementId: 'r' }] },
    ])('rejects invalid element or relationship invariants %p', value => {
        expect(() => validateDiagramDocument(value)).toThrow('Invalid Diagram');
    });

    it('allows separate ID namespaces and distinct pairs without changing the input', () => {
        const document = {
            ...valid,
            connections: [connection, { ...connection, id: 'r', sourceElementId: 'e', targetElementId: 'n' }],
        };
        const before = JSON.stringify(document);
        expect(validateDiagramDocument(document)).toEqual(document);
        expect(JSON.stringify(document)).toBe(before);
    });
});
