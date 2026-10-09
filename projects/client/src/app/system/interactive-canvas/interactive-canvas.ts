import { Injectable, inject } from '@angular/core';
import { BROWSER } from './browser';
import type { ICanvas } from './canvas';

@Injectable()
export class InteractiveCanvas implements ICanvas {
    private readonly browser = inject(BROWSER);
    private session: {
        element: HTMLCanvasElement;
        requestDraw: () => void;
        stop: () => void;
    } | undefined;

    initialize(element: HTMLCanvasElement, render: Parameters<ICanvas['initialize']>[1]): void {
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
                render(context, width, height);
            });
        };
        const resize = () => {
            element.width = Math.round(this.browser.displayedWidth(element) * this.browser.devicePixelRatio());
            element.height = Math.round(this.browser.displayedHeight(element) * this.browser.devicePixelRatio());
            requestDraw();
        };
        resize();
        const stopObserving = this.browser.observeResize(element, resize);
        this.session = {
            element,
            requestDraw,
            stop: () => {
                stopObserving();
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
        return this.browser.canvasPoint(this.requireSession().element, event);
    }

    capturePointer(pointerId: number): void {
        this.browser.capturePointer(this.requireSession().element, pointerId);
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
