import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { BROWSER } from './browser';
import type { IBrowser } from './browser';

@Component({
    selector: 'app-interactive-canvas',
    standalone: true,
    templateUrl: './interactive-canvas.component.html',
    styleUrl: './interactive-canvas.component.scss',
})
export class InteractiveCanvasComponent implements AfterViewInit, OnDestroy {
    @ViewChild('canvas', { static: true }) private canvas!: ElementRef<HTMLCanvasElement>;
    private refreshTimer: ReturnType<typeof setInterval> | undefined;
    private readonly browser = inject(BROWSER);
    private stopObserving: (() => void) | undefined;

    ngAfterViewInit(): void {
        const canvas = this.canvas.nativeElement;
        const context = this.browser.getContext(canvas);
        if (!context) {
            throw new Error('Unable to initialize canvas clock: 2D context is unavailable.');
        }

        const resizeCanvas = () => {
            canvas.width = Math.round(this.browser.displayedWidth(canvas) * this.browser.devicePixelRatio());
            canvas.height = Math.round(this.browser.displayedHeight(canvas) * this.browser.devicePixelRatio());
            this.drawTime(canvas, context);
        };
        resizeCanvas();
        this.stopObserving = this.browser.observeResize(canvas, resizeCanvas);
        this.refreshTimer = setInterval(() => this.drawTime(canvas, context), 1000);
    }

    ngOnDestroy(): void {
        if (this.refreshTimer !== undefined) {
            clearInterval(this.refreshTimer);
        }
        this.stopObserving?.();
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
    }
}
