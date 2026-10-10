import { describe, expect, it } from '@jest/globals';
import { drawActor, drawArtifact, drawBusinessRole, drawProduct, drawSystemSoftware, drawSymbolConnection, drawSymbolPreview } from './canvas-symbols';
import { recordingCanvasContext } from './testing/recording-canvas-context';

describe('architecture canvas symbols', () => {
    it('keeps actor proportions recognizable in an 80-pixel-high editor part', () => {
        const { context, operations } = recordingCanvasContext();
        drawActor(context, { x: 0, y: 0, width: 60, height: 80 }, 'Dev');
        const points = operations.filter(op => op.name === 'lineTo').map(op => op.args as number[]);
        expect(points.some(([x, y]) => x === 9 && y === 60)).toBe(true);
    });
    it.each([
        { x: NaN, y: 0, width: 80, height: 80 },
        { x: 0, y: 0, width: 59, height: 80 },
        { x: 0, y: 0, width: 80, height: 59 },
    ])('rejects invalid bounds rather than drawing corrupt geometry: %j', bounds => {
        const { context, operations } = recordingCanvasContext();
        expect(() => drawArtifact(context, bounds, ['Label'])).toThrow('Canvas symbol bounds');
        expect(operations).toHaveLength(0);
    });

    it.each([[NaN, 1000], [360, NaN], [159, 1000], [360, 899]])('rejects invalid preview dimensions %i x %i', (width, height) => {
        const { context } = recordingCanvasContext();
        expect(() => drawSymbolPreview(context, width, height)).toThrow('Canvas symbol preview');
    });

    it('rejects invalid connection coordinates', () => {
        const { context } = recordingCanvasContext();
        expect(() => drawSymbolConnection(context, { x: NaN, y: 1 }, { x: 2, y: 3 })).toThrow('finite coordinates');
    });

    it('restores clipping and styles when a drawing boundary fails', () => {
        const { context, operations } = recordingCanvasContext();
        context.stroke = () => { throw new Error('Stroke failed'); };
        expect(() => drawArtifact(context, { x: 0, y: 0, width: 100, height: 100 }, ['Label'])).toThrow('Stroke failed');
        expect(context.strokeStyle).toBe('#original');
        expect(operations.filter(op => op.name === 'restore')).toHaveLength(2);
    });

    it.each([
        ['artifact', drawArtifact, '#269b45'],
        ['system software', drawSystemSoftware, '#269b45'],
        ['business role', drawBusinessRole, '#d98200'],
        ['product', drawProduct, '#d98200'],
    ])('renders %s with colored hatching, an icon, and centered labels', (_name, draw, color) => {
        const { context, operations } = recordingCanvasContext();
        draw(context, { x: 10, y: 20, width: 220, height: 100 }, ['Type:', '<Name>']);
        expect(operations.filter(op => op.name === 'strokeRect')[0]?.args).toEqual([10, 20, 220, 100]);
        expect(operations.some(op => op.color === color)).toBe(true);
        expect(operations.filter(op => op.name === 'clip')).toHaveLength(1);
        expect(operations.filter(op => op.name === 'stroke').length).toBeGreaterThan(5);
        expect(operations.filter(op => op.name === 'fillText').map(op => op.args[0])).toEqual(['Type:', '<Name>']);
        expect(context.strokeStyle).toBe('#original');
        expect(context.font).toBe('original');
        expect(operations.filter(op => op.name === 'save')).toHaveLength(2);
        expect(operations.filter(op => op.name === 'restore')).toHaveLength(2);
    });

    it('renders a cross-hatched actor with a head, body and label', () => {
        const { context, operations } = recordingCanvasContext();
        drawActor(context, { x: 20, y: 30, width: 80, height: 120 }, 'Dev');
        expect(operations.filter(op => op.name === 'clip')).toHaveLength(2);
        expect(operations.find(op => op.name === 'fillText')?.args[0]).toBe('Dev');
        expect(operations.some(op => op.name === 'stroke' && op.color === '#202020')).toBe(true);
        expect(context.strokeStyle).toBe('#original');
    });

    it('draws a connection without leaking state', () => {
        const { context, operations } = recordingCanvasContext();
        drawSymbolConnection(context, { x: 1, y: 2 }, { x: 100, y: 90 });
        expect(operations.find(op => op.name === 'moveTo')?.args).toEqual([1, 2]);
        expect(operations.find(op => op.name === 'lineTo')?.args).toEqual([100, 90]);
        expect(context.lineWidth).toBe(7);
    });

    it.each([360, 1000])('renders all reference symbols within a %i-pixel preview', width => {
        const { context, operations } = recordingCanvasContext();
        drawSymbolPreview(context, width, 1000);
        const texts = operations.filter(op => op.name === 'fillText').map(op => op.args[0]);
        expect(texts).toEqual(expect.arrayContaining(['Artifact:', '<AI Workflow>', '<TaskScore(RICE)>', 'System software:', 'Business role:', 'Product:', 'Dev']));
        for (const op of operations.filter(op => op.name === 'strokeRect')) {
            const [x, y, w, h] = op.args as number[];
            expect(x).toBeGreaterThanOrEqual(0);
            expect(y).toBeGreaterThanOrEqual(0);
            expect(x + w).toBeLessThanOrEqual(width);
            expect(y + h).toBeLessThanOrEqual(1000);
        }
    });
});
