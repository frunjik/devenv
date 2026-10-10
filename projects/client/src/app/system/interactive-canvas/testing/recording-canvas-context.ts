import type { CanvasRenderContext } from '../canvas';

interface DrawingOperation {
    name: string;
    args: (string | number)[];
    color: string | CanvasGradient | CanvasPattern;
}

export function recordingCanvasContext() {
    const operations: DrawingOperation[] = [];
    const stack: { strokeStyle: string | CanvasGradient | CanvasPattern; fillStyle: string | CanvasGradient | CanvasPattern; font: string; lineWidth: number; textAlign: CanvasTextAlign; textBaseline: CanvasTextBaseline }[] = [];
    const record = (name: string, args: (string | number)[] = []) => {
        operations.push({ name, args, color: context.strokeStyle });
    };
    const context: CanvasRenderContext = {
        strokeStyle: '#original', fillStyle: '#original', font: 'original',
        lineWidth: 7, textAlign: 'left', textBaseline: 'alphabetic',
        fillText: (text, x, y, maxWidth) => record('fillText', [text, x, y, ...(maxWidth === undefined ? [] : [maxWidth])]),
        strokeRect: (x, y, width, height) => record('strokeRect', [x, y, width, height]),
        beginPath: () => record('beginPath'),
        moveTo: (x, y) => record('moveTo', [x, y]),
        lineTo: (x, y) => record('lineTo', [x, y]),
        stroke: () => record('stroke'),
        clip: () => record('clip'),
        setLineDash: segments => record('setLineDash', [...segments]),
        save: () => {
            stack.push({ strokeStyle: context.strokeStyle, fillStyle: context.fillStyle, font: context.font, lineWidth: context.lineWidth, textAlign: context.textAlign, textBaseline: context.textBaseline });
            record('save');
        },
        restore: () => { Object.assign(context, stack.pop()); record('restore'); },
    };
    return { context, operations };
}
