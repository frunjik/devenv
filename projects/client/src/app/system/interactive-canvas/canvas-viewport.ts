interface Point {
    x: number;
    y: number;
}

export class CanvasViewport {
    zoom = 1;
    x = 0;
    y = 0;
    private pan: { pointerId: number; point: Point } | undefined;

    point(point: Point): Point {
        return { x: (point.x - this.x) / this.zoom, y: (point.y - this.y) / this.zoom };
    }

    wheel(event: WheelEvent, point: Point, height: number): void {
        const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? height : 1);
        const anchor = this.point(point);
        this.zoom = Math.max(.25, Math.min(4, this.zoom * Math.exp(-delta * .002)));
        this.x = point.x - anchor.x * this.zoom;
        this.y = point.y - anchor.y * this.zoom;
    }

    beginPan(event: PointerEvent): void {
        this.pan = { pointerId: event.pointerId, point: { x: event.clientX, y: event.clientY } };
    }

    movePan(event: PointerEvent): boolean {
        if (!this.pan || this.pan.pointerId !== event.pointerId) return false;
        this.x += event.clientX - this.pan.point.x;
        this.y += event.clientY - this.pan.point.y;
        this.pan.point = { x: event.clientX, y: event.clientY };
        return true;
    }

    endPan(event: PointerEvent): void {
        if (this.pan?.pointerId === event.pointerId) this.pan = undefined;
    }

    reset(): void {
        this.zoom = 1;
        this.x = 0;
        this.y = 0;
        this.pan = undefined;
    }
}
