import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';

@Component({
    selector: 'app-interactive-canvas',
    standalone: true,
    templateUrl: './interactive-canvas.component.html',
    styleUrl: './interactive-canvas.component.scss',
})
export class InteractiveCanvasComponent implements AfterViewInit, OnDestroy {
    @ViewChild('canvas', { static: true }) private canvas!: ElementRef<HTMLCanvasElement>;
    private refreshTimer: ReturnType<typeof setInterval> | undefined;

    ngAfterViewInit(): void {
        const canvas = this.canvas.nativeElement;
        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error('Unable to initialize canvas clock: 2D context is unavailable.');
        }

        this.drawTime(canvas, context);
        this.refreshTimer = setInterval(() => this.drawTime(canvas, context), 1000);
    }

    ngOnDestroy(): void {
        if (this.refreshTimer !== undefined) {
            clearInterval(this.refreshTimer);
        }
    }

    private drawTime(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = '24px sans-serif';
        context.fillText(
            new Date().toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }),
            canvas.width / 2,
            canvas.height / 2,
        );
    }
}
