import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild, inject } from '@angular/core';
import { BROWSER } from './browser';
import type { IBrowser } from './browser';

interface SketchPart {
    label: string;
    position: { x: number; y: number };
}

interface CanvasDrag {
    pointerId: number;
    offset: { x: number; y: number };
}

@Component({
    selector: 'app-interactive-canvas',
    standalone: true,
    templateUrl: './interactive-canvas.component.html',
    styleUrl: './interactive-canvas.component.scss',
})
export class InteractiveCanvasComponent implements AfterViewInit, OnDestroy {
    @Output() readonly pointerMoved = new EventEmitter<ReturnType<IBrowser['canvasPoint']>>();
    @ViewChild('canvas', { static: true }) private canvas!: ElementRef<HTMLCanvasElement>;
    private refreshTimer: ReturnType<typeof setInterval> | undefined;
    private readonly browser = inject(BROWSER);
    private stopObserving: (() => void) | undefined;
    private pendingFrame: number | undefined;
    part: SketchPart | undefined;
    selected = false;
    private drag: CanvasDrag | undefined;
    private requestDraw!: () => void;

    addPart(): void {
        this.part = { label: 'DevEnv client', position: { x: 24, y: 24 } };
        this.requestDraw();
    }

    movePointer(event: PointerEvent): void {
        const point = this.browser.canvasPoint(this.canvas.nativeElement, event);
        this.pointerMoved.emit(point);
        if (this.part && this.drag && this.drag.pointerId === event.pointerId) {
            this.part.position = { x: point.x - this.drag.offset.x, y: point.y - this.drag.offset.y };
            this.requestDraw();
        }
    }

    selectPart(event: PointerEvent): void {
        if (event.button !== 0 || this.drag) {
            return;
        }
        const point = this.browser.canvasPoint(this.canvas.nativeElement, event);
        const part = this.part;
        this.selected = !!part && point.x >= part.position.x && point.x <= part.position.x + 180
            && point.y >= part.position.y && point.y <= part.position.y + 80;
        if (this.selected && part) {
            this.browser.capturePointer(this.canvas.nativeElement, event.pointerId);
            this.drag = {
                pointerId: event.pointerId,
                offset: { x: point.x - part.position.x, y: point.y - part.position.y },
            };
        }
        this.requestDraw();
    }

    endDrag(event: PointerEvent): void {
        if (this.drag?.pointerId === event.pointerId) {
            this.drag = undefined;
        }
    }

    renamePart(label: string): void {
        if (this.part) {
            this.part.label = label;
            this.requestDraw();
        }
    }

    ngAfterViewInit(): void {
        const canvas = this.canvas.nativeElement;
        const context = this.browser.getContext(canvas);
        if (!context) {
            throw new Error('Unable to initialize canvas clock: 2D context is unavailable.');
        }

        const requestDraw = () => {
            if (this.pendingFrame !== undefined) {
                return;
            }
            this.pendingFrame = this.browser.requestAnimationFrame(() => {
                this.pendingFrame = undefined;
                this.drawTime(canvas, context);
            });
        };
        const resizeCanvas = () => {
            canvas.width = Math.round(this.browser.displayedWidth(canvas) * this.browser.devicePixelRatio());
            canvas.height = Math.round(this.browser.displayedHeight(canvas) * this.browser.devicePixelRatio());
            requestDraw();
        };
        this.requestDraw = requestDraw;
        resizeCanvas();
        this.stopObserving = this.browser.observeResize(canvas, resizeCanvas);
        this.refreshTimer = setInterval(requestDraw, 1000);
    }

    ngOnDestroy(): void {
        if (this.refreshTimer !== undefined) {
            clearInterval(this.refreshTimer);
        }
        this.stopObserving?.();
        if (this.pendingFrame !== undefined) {
            this.browser.cancelAnimationFrame(this.pendingFrame);
        }
    }

    private drawTime(
        canvas: HTMLCanvasElement,
        context: NonNullable<ReturnType<IBrowser['getContext']>>,
    ): void {
        const ratio = this.browser.devicePixelRatio();
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        context.clearRect(0, 0, canvas.width / ratio, canvas.height / ratio);
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = '24px sans-serif';
        context.fillText(
            new Date().toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }),
            canvas.width / ratio / 2,
            canvas.height / ratio / 2,
        );
        if (this.part) {
            const { x, y } = this.part.position;
            context.lineWidth = this.selected ? 3 : 1;
            context.strokeRect(x, y, 180, 80);
            context.font = '16px sans-serif';
            context.fillText(this.part.label, x + 90, y + 40);
        }
    }
}
