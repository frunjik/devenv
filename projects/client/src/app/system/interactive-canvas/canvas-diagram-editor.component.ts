import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild, inject } from '@angular/core';
import { CANVAS } from './canvas';
import type { ICanvas } from './canvas';
import { InteractiveCanvas } from './interactive-canvas';
import { SCHEDULER } from '../../scheduler';

interface SketchPart {
    label: string;
    position: { x: number; y: number };
}

interface CanvasDrag {
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
    part: SketchPart | undefined;
    selected = false;
    private drag: CanvasDrag | undefined;

    addPart(): void {
        this.part = { label: 'DevEnv client', position: { x: 24, y: 24 } };
        this.surface.requestDraw();
    }

    movePointer(event: PointerEvent): void {
        const point = this.surface.point(event);
        this.pointerMoved.emit(point);
        if (this.part && this.drag && this.drag.pointerId === event.pointerId) {
            this.part.position = { x: point.x - this.drag.offset.x, y: point.y - this.drag.offset.y };
            this.surface.requestDraw();
        }
    }

    selectPart(event: PointerEvent): void {
        if (event.button !== 0 || this.drag) {
            return;
        }
        const point = this.surface.point(event);
        const part = this.part;
        this.selected = !!part && point.x >= part.position.x && point.x <= part.position.x + 180
            && point.y >= part.position.y && point.y <= part.position.y + 80;
        if (this.selected && part) {
            this.surface.capturePointer(event.pointerId);
            this.drag = {
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
        if (this.part) {
            this.part.label = label;
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
        if (this.part) {
            const { x, y } = this.part.position;
            context.lineWidth = this.selected ? 3 : 1;
            context.strokeRect(x, y, 180, 80);
            context.font = '16px sans-serif';
            context.fillText(this.part.label, x + 90, y + 40);
        };
    }
}
