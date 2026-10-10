import { Injectable, inject } from '@angular/core';
import { BROWSER } from './browser';
import type { ICanvas } from './canvas';
import { CanvasViewport } from './canvas-viewport';

@Injectable()
export class InteractiveCanvas implements ICanvas {
    private readonly browser = inject(BROWSER);
    private readonly viewport = new CanvasViewport();
    private session: {
        element: HTMLCanvasElement;
        requestDraw: () => void;
        stop: () => void;
    } | undefined;

    initialize(element: HTMLCanvasElement, render: Parameters<ICanvas['initialize']>[1], navigation = false): void {
        if (this.session) {
            throw new Error('Canvas is already initialized.');
        }
        const context = this.browser.getContext(element);
        if (!context) {
            throw new Error('Unable to initialize canvas: 2D context is unavailable.');
        }
        let pendingFrame: number | undefined;
        const requestDraw = () => {
            if (pendingFrame !== undefined) {
                return;
            }
            pendingFrame = this.browser.requestAnimationFrame(() => {
                pendingFrame = undefined;
                const ratio = this.browser.devicePixelRatio();
                const width = element.width / ratio;
                const height = element.height / ratio;
                context.setTransform(ratio, 0, 0, ratio, 0, 0);
                context.clearRect(0, 0, width, height);
                context.setTransform(ratio * this.viewport.zoom, 0, 0, ratio * this.viewport.zoom,
                    ratio * this.viewport.x, ratio * this.viewport.y);
                render(context, width, height);
            });
        };
        const resize = () => {
            element.width = Math.round(this.browser.displayedWidth(element) * this.browser.devicePixelRatio());
            element.height = Math.round(this.browser.displayedHeight(element) * this.browser.devicePixelRatio());
            requestDraw();
        };
        resize();
        const wheel = (event: WheelEvent) => {
            if (!navigation || !event.ctrlKey) return;
            event.preventDefault();
            this.viewport.wheel(event, this.browser.canvasPoint(element, event), this.browser.displayedHeight(element));
            requestDraw();
        };
        element.addEventListener('wheel', wheel, { passive: false });
        const stopObserving = this.browser.observeResize(element, resize);
        this.session = {
            element,
            requestDraw,
            stop: () => {
                stopObserving();
                element.removeEventListener('wheel', wheel);
                this.viewport.reset();
                if (pendingFrame !== undefined) {
                    this.browser.cancelAnimationFrame(pendingFrame);
                }
            },
        };
    }

    requestDraw(): void {
        this.requireSession().requestDraw();
    }

    point(event: Pick<MouseEvent, 'clientX' | 'clientY'>): { x: number; y: number } {
        return this.viewport.point(this.browser.canvasPoint(this.requireSession().element, event));
    }

    capturePointer(pointerId: number): void {
        this.browser.capturePointer(this.requireSession().element, pointerId);
    }

    resetView(): void {
        this.viewport.reset();
        this.requestDraw();
    }

    beginPan(event: PointerEvent): void {
        this.capturePointer(event.pointerId);
        this.viewport.beginPan(event);
    }

    movePan(event: PointerEvent): boolean {
        if (!this.viewport.movePan(event)) return false;
        this.requestDraw();
        return true;
    }

    endPan(event: PointerEvent): void {
        this.viewport.endPan(event);
    }

    destroy(): void {
        this.session?.stop();
        this.session = undefined;
    }

    private requireSession() {
        if (!this.session) {
            throw new Error('Canvas is not initialized.');
        }
        return this.session;
    }
}
