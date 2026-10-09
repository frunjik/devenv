import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild, inject } from '@angular/core';
import { CANVAS } from './canvas';
import type { ICanvas } from './canvas';
import { InteractiveCanvas } from './interactive-canvas';
import { SCHEDULER } from '../../scheduler';

interface SketchPart {
    readonly id: number;
    label: string;
    position: { x: number; y: number };
}

interface CanvasDrag {
    part: SketchPart;
    pointerId: number;
    offset: { x: number; y: number };
}

@Component({
    selector: 'app-canvas-diagram-editor',
    standalone: true,
    templateUrl: './canvas-diagram-editor.component.html',
    styleUrl: './canvas-diagram-editor.component.scss',
    providers: [{ provide: CANVAS, useClass: InteractiveCanvas }],
})
export class CanvasDiagramEditor implements AfterViewInit, OnDestroy {
    @Output() readonly pointerMoved = new EventEmitter<ReturnType<ICanvas['point']>>();
    @ViewChild('canvas', { static: true }) private canvas!: ElementRef<HTMLCanvasElement>;
    private stopRefresh: (() => void) | undefined;
    private readonly scheduler = inject(SCHEDULER);
    private readonly surface = inject(CANVAS);
    parts: SketchPart[] = [];
    selectedPart: SketchPart | undefined;
    private nextPartId = 1;
    private drag: CanvasDrag | undefined;

    addPart(): void {
        const id = this.nextPartId++;
        const offset = 24 + ((id - 1) % 4) * 24;
        this.parts.push({ id, label: `Part ${id}`, position: { x: offset, y: offset } });
        this.surface.requestDraw();
    }

    movePointer(event: PointerEvent): void {
        const point = this.surface.point(event);
        this.pointerMoved.emit(point);
        if (this.drag && this.drag.pointerId === event.pointerId) {
            this.drag.part.position = { x: point.x - this.drag.offset.x, y: point.y - this.drag.offset.y };
            this.surface.requestDraw();
        }
    }

    selectPart(event: PointerEvent): void {
        if (event.button !== 0 || this.drag) {
            return;
        }
        const point = this.surface.point(event);
        const part = [...this.parts].reverse().find(candidate =>
            point.x >= candidate.position.x && point.x <= candidate.position.x + 180
            && point.y >= candidate.position.y && point.y <= candidate.position.y + 80);
        this.selectedPart = part;
        if (part) {
            this.surface.capturePointer(event.pointerId);
            this.drag = {
                part,
                pointerId: event.pointerId,
                offset: { x: point.x - part.position.x, y: point.y - part.position.y },
            };
        }
        this.surface.requestDraw();
    }

    endDrag(event: PointerEvent): void {
        if (this.drag?.pointerId === event.pointerId) {
            this.drag = undefined;
        }
    }

    renamePart(label: string): void {
        if (this.selectedPart) {
            this.selectedPart.label = label;
            this.surface.requestDraw();
        }
    }

    removeSelectedPart(): void {
        if (this.selectedPart) {
            this.parts = this.parts.filter(part => part !== this.selectedPart);
            this.selectedPart = undefined;
            this.drag = undefined;
            this.surface.requestDraw();
        }
    }

    ngAfterViewInit(): void {
        this.surface.initialize(this.canvas.nativeElement, this.render);
        this.stopRefresh = this.scheduler.every(1000, () => this.surface.requestDraw());
    }

    ngOnDestroy(): void {
        this.stopRefresh?.();
        this.surface.destroy();
    }

    private readonly render: Parameters<ICanvas['initialize']>[1] = (context, width, height) => {
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = '24px sans-serif';
        context.fillText(
            new Date().toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }),
            width / 2,
            height / 2,
        );
        for (const part of this.parts) {
            const { x, y } = part.position;
            context.lineWidth = part === this.selectedPart ? 3 : 1;
            context.strokeRect(x, y, 180, 80);
            context.font = '16px sans-serif';
            context.fillText(part.label, x + 90, y + 40);
        }
    }
}
