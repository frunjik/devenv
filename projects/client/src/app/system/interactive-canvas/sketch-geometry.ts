import type { SymbolBounds, SymbolPoint } from './canvas-symbols';
import type { SketchConnection, SketchPart } from './sketch.types';

export interface ConnectionLine {
    first: SymbolPoint;
    second: SymbolPoint;
}

export function partBounds(part: SketchPart): SymbolBounds {
    const { x, y } = part.position;
    // Preserve the actor's existing center while tightening its interaction bounds.
    return part.shape === 'actor'
        ? { x: x + 60, y: y - 10, width: 60, height: 100 }
        : { x, y, width: 180, height: 80 };
}

export function connectionLine(connection: SketchConnection): ConnectionLine {
    const firstBounds = partBounds(connection.first);
    const secondBounds = partBounds(connection.second);
    const first = { x: firstBounds.x + firstBounds.width / 2, y: firstBounds.y + firstBounds.height / 2 };
    const second = { x: secondBounds.x + secondBounds.width / 2, y: secondBounds.y + secondBounds.height / 2 };
    const dx = second.x - first.x;
    const dy = second.y - first.y;
    const firstScale = dx === 0 && dy === 0 ? 0
        : Math.min(0.5, firstBounds.width / 2 / Math.abs(dx), firstBounds.height / 2 / Math.abs(dy));
    const secondScale = dx === 0 && dy === 0 ? 0
        : Math.min(0.5, secondBounds.width / 2 / Math.abs(dx), secondBounds.height / 2 / Math.abs(dy));
    return {
        first: { x: first.x + dx * firstScale, y: first.y + dy * firstScale },
        second: { x: second.x - dx * secondScale, y: second.y - dy * secondScale },
    };
}

export function findPartAt(parts: readonly SketchPart[], point: SymbolPoint): SketchPart | undefined {
    return [...parts].reverse().find(candidate => {
        const bounds = partBounds(candidate);
        return point.x >= bounds.x && point.x <= bounds.x + bounds.width
            && point.y >= bounds.y && point.y <= bounds.y + bounds.height;
    });
}

export function findConnectionAt(connections: readonly SketchConnection[], point: SymbolPoint): SketchConnection | undefined {
    return [...connections].reverse().find(connection => {
        const { first, second } = connectionLine(connection);
        const dx = second.x - first.x;
        const dy = second.y - first.y;
        const lengthSquared = dx * dx + dy * dy;
        const projection = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1,
            ((point.x - first.x) * dx + (point.y - first.y) * dy) / lengthSquared));
        return Math.hypot(point.x - first.x - projection * dx, point.y - first.y - projection * dy) <= 6;
    });
}
