import { describe, expect, it } from '@jest/globals';
import { createDefaultTemplate } from './default-template';
import source from './default-template.json';

describe('default workflow template', () => {
    it('validates the main reference diagram and returns fresh editable geometry', () => {
        const first = createDefaultTemplate();
        const second = createDefaultTemplate();
        expect(first.geometry.elements).toHaveLength(25);
        expect(first.geometry.connections).toHaveLength(28);
        expect(Object.keys(first.shapes)).toHaveLength(25);
        expect(first.geometry.elements.filter(element =>
            !first.geometry.connections.some(connection =>
                connection.sourceElementId === element.id || connection.targetElementId === element.id))
            .map(element => element.label)).toEqual(['AI Workflow', 'Locus']);
        first.geometry.elements[0].label = 'Changed';
        first.geometry.elements[0].position.x = 999;
        first.shapes['dev'] = 'product';
        expect(second.geometry.elements[0]).toMatchObject({ label: 'Dev', position: { x: 400, y: 30 } });
        expect(second.shapes['dev']).toBe('actor');
        expect(source.geometry.elements[0].label).toBe('Dev');
    });

    it.each([null, 1, [], 'template'])('rejects a non-record template: %j', value => {
        expect(() => createDefaultTemplate(value)).toThrow('expected geometry and shapes');
    });

    it.each([null, 1, [], 'shapes'])('rejects a non-record shape map: %j', shapes => {
        expect(() => createDefaultTemplate({ ...source, shapes })).toThrow('expected a shape map');
    });

    it('rejects invalid geometry through the existing diagram validation boundary', () => {
        expect(() => createDefaultTemplate({ ...source, geometry: null })).toThrow('Invalid Diagram');
    });

    it('rejects a shape map missing elements', () => {
        expect(() => createDefaultTemplate({ ...source, shapes: {} })).toThrow('every element needs one shape');
    });

    it('rejects a same-sized map containing an unknown element', () => {
        const { dev: _dev, ...shapes } = source.shapes;
        expect(() => createDefaultTemplate({ ...source, shapes: { ...shapes, missing: 'actor' } }))
            .toThrow('unknown element or unsupported shape');
    });

    it('rejects unsupported shapes', () => {
        expect(() => createDefaultTemplate({ ...source, shapes: { ...source.shapes, dev: 'unknown' } }))
            .toThrow('unknown element or unsupported shape');
    });
});
