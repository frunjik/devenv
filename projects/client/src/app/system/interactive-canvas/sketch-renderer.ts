import type { CanvasRenderContext } from './canvas';
import { drawActor, drawArtifact, drawBusinessRole, drawProduct, drawSystemSoftware, drawTechProcess } from './canvas-symbols';
import { connectionLine, partBounds } from './sketch-geometry';
import type { SketchBoundary, SketchConnection, SketchPart } from './sketch.types';
import type { SketchSelection } from './sketch-selection';

const symbolRenderers = {
    artifact: { draw: drawArtifact, heading: 'Artifact:' },
    'system-software': { draw: drawSystemSoftware, heading: 'System software:' },
    'business-role': { draw: drawBusinessRole, heading: 'Business role:' },
    product: { draw: drawProduct, heading: 'Product:' },
    'tech-process': { draw: drawTechProcess, heading: 'Tech process:' },
};

export interface SketchRenderState {
    parts: readonly SketchPart[];
    connections: readonly SketchConnection[];
    boundaries: readonly SketchBoundary[];
    selection: SketchSelection;
    technicalLoaded: boolean;
    overviewLoaded: boolean;
}

export function renderSketch(context: CanvasRenderContext, width: number, height: number, state: SketchRenderState): void {
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    if (!state.technicalLoaded) {
        context.font = '24px sans-serif';
        context.fillText(
            new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            width / 2, height / 2,
        );
    }
    for (const boundary of state.boundaries) drawBoundary(context, boundary);
    for (const part of state.parts) drawPart(context, part, state);
    for (const connection of state.connections) drawConnection(context, connection, state);
}

function drawBoundary(context: CanvasRenderContext, boundary: SketchBoundary): void {
    const bounds = boundary.parts.map(partBounds);
    const left = Math.min(...bounds.map(part => part.x)) - 28;
    const top = Math.min(...bounds.map(part => part.y)) - 48;
    const right = Math.max(...bounds.map(part => part.x + part.width)) + 28;
    const bottom = Math.max(...bounds.map(part => part.y + part.height)) + 28;
    context.lineWidth = 1;
    context.strokeRect(left, top, right - left, bottom - top);
    context.font = '16px sans-serif';
    context.fillText(boundary.label, (left + right) / 2, top + 20, right - left - 16);
}

function drawPart(context: CanvasRenderContext, part: SketchPart, state: SketchRenderState): void {
    const { x, y } = part.position;
    if (part.shape && part.shape !== 'rectangle') {
        const bounds = partBounds(part);
        if (part.shape === 'actor') {
            // Keep the drawing in place inside the padded interaction bounds.
            drawActor(context, { ...bounds, y, height: 80 }, part.label);
        } else {
            const symbol = symbolRenderers[part.shape];
            symbol.draw(context, bounds, [symbol.heading, `<${part.label}>`]);
        }
        if (state.selection.has(part)) {
            context.lineWidth = 3;
            context.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        }
        return;
    }
    context.lineWidth = state.selection.has(part) ? 3 : 1;
    context.strokeRect(x, y, 180, 80);
    context.font = '16px sans-serif';
    if (state.technicalLoaded) {
        drawWrappedText(context, part.label, x + 90, y + 24, 22, 16, 164);
        if (part.technology) {
            context.font = '12px sans-serif';
            context.fillText(part.technology, x + 90, y + 64, 164);
        }
    } else if (state.overviewLoaded) {
        context.fillText(part.label, x + 90, y + 40, 164);
    } else {
        context.fillText(part.label, x + 90, y + 40);
    }
}

function drawConnection(context: CanvasRenderContext, connection: SketchConnection, state: SketchRenderState): void {
    const { first, second } = connectionLine(connection);
    context.lineWidth = state.selection.has(connection) ? 3 : 1;
    context.beginPath();
    context.moveTo(first.x, first.y);
    context.lineTo(second.x, second.y);
    context.stroke();
    const dx = second.x - first.x;
    const dy = second.y - first.y;
    const length = Math.hypot(dx, dy);
    if (connection.directed && length > 0) {
        const ux = dx / length;
        const uy = dy / length;
        context.beginPath();
        context.moveTo(second.x - 10 * ux + 5 * uy, second.y - 10 * uy - 5 * ux);
        context.lineTo(second.x, second.y);
        context.lineTo(second.x - 10 * ux - 5 * uy, second.y - 10 * uy + 5 * ux);
        context.stroke();
    }
    context.font = '14px sans-serif';
    const labelX = (first.x + second.x) / 2;
    const labelY = (first.y + second.y) / 2;
    if (state.technicalLoaded) {
        const textX = labelX + (connection.labelOffset?.x ?? 0);
        const textY = labelY + (connection.labelOffset?.y ?? -40);
        drawWrappedText(context, connection.label, textX, textY, 26, 16, 240);
        if (connection.technology) {
            context.font = '12px sans-serif';
            drawWrappedText(context, connection.technology, textX, textY + 48, 30, 14, 240);
        }
    } else {
        context.fillText(connection.label, labelX, labelY - 10);
    }
}

function drawWrappedText(
    context: CanvasRenderContext,
    text: string, x: number, y: number, characters: number, lineHeight: number, maxWidth: number,
): void {
    let line = '';
    for (const word of text.split(/\s+/)) {
        if (line && line.length + word.length + 1 > characters) {
            context.fillText(line, x, y, maxWidth);
            y += lineHeight;
            line = word;
        } else {
            line += (line ? ' ' : '') + word;
        }
    }
    context.fillText(line, x, y, maxWidth);
}
