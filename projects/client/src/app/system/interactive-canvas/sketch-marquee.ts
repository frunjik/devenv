import type { SymbolBounds, SymbolPoint } from './canvas-symbols';
import { connectionLine, partBounds } from './sketch-geometry';
import type { SketchConnection, SketchPart } from './sketch.types';
import type { SketchSelection } from './sketch-selection';

export class SketchMarquee {
    private gesture: { pointerId: number; start: SymbolPoint; end: SymbolPoint; moved: boolean } | undefined;

    get active(): boolean { return this.gesture !== undefined; }

    get bounds(): SymbolBounds | undefined {
        if (!this.gesture?.moved) return undefined;
        const { start, end } = this.gesture;
        return {
            x: Math.min(start.x, end.x), y: Math.min(start.y, end.y),
            width: Math.abs(start.x - end.x), height: Math.abs(start.y - end.y),
        };
    }

    begin(pointerId: number, point: SymbolPoint): void {
        this.gesture = { pointerId, start: point, end: point, moved: false };
    }

    move(pointerId: number, point: SymbolPoint): boolean {
        if (!this.gesture || this.gesture.pointerId !== pointerId) return false;
        this.gesture.end = point;
        this.gesture.moved ||= point.x !== this.gesture.start.x || point.y !== this.gesture.start.y;
        return true;
    }

    end(event: PointerEvent, point: SymbolPoint, parts: readonly SketchPart[],
        connections: readonly SketchConnection[], selection: SketchSelection): boolean {
        if (!this.gesture || this.gesture.pointerId !== event.pointerId) return false;
        if (event.type === 'pointerup') {
            this.move(event.pointerId, point);
            const bounds = this.bounds;
            if (!bounds) {
                selection.clear();
            } else {
                const enclosed = (point: SymbolPoint) => point.x >= bounds.x && point.y >= bounds.y
                    && point.x <= bounds.x + bounds.width && point.y <= bounds.y + bounds.height;
                for (const part of parts) {
                    const box = partBounds(part);
                    if (enclosed(box) && enclosed({ x: box.x + box.width, y: box.y + box.height })) {
                        if (!selection.has(part)) selection.check(part, true);
                    }
                }
                for (const connection of connections) {
                    const line = connectionLine(connection);
                    if (enclosed(line.first) && enclosed(line.second)) {
                        if (!selection.has(connection)) selection.check(connection, true);
                    }
                }
            }
        }
        this.cancel();
        return true;
    }

    cancel(): void { this.gesture = undefined; }
}
