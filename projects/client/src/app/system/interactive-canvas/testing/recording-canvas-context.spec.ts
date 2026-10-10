import { describe, expect, it } from '@jest/globals';
import { recordingCanvasContext } from './recording-canvas-context';

describe('recording canvas context', () => {
    it('records text with and without an explicit maximum width', () => {
        const { context, operations } = recordingCanvasContext();
        context.fillText('Unbounded label', 10, 20);
        context.fillText('Bounded label', 30, 40, 120);
        expect(operations).toEqual([
            { name: 'fillText', args: ['Unbounded label', 10, 20], color: '#original' },
            { name: 'fillText', args: ['Bounded label', 30, 40, 120], color: '#original' },
        ]);
    });
});
