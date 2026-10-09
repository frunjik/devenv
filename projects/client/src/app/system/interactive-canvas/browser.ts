import { InjectionToken } from '@angular/core';

export interface IBrowser {
    requestAnimationFrame(callback: () => void): number;
    cancelAnimationFrame(id: number): void;
    getContext(canvas: HTMLCanvasElement): Pick<CanvasRenderingContext2D,
        'clearRect' | 'setTransform' | 'fillText' | 'textAlign' | 'textBaseline' | 'font'> | null;
    displayedWidth(canvas: HTMLCanvasElement): number;
    displayedHeight(canvas: HTMLCanvasElement): number;
    devicePixelRatio(): number;
    canvasPoint(
        canvas: HTMLCanvasElement,
        event: Pick<MouseEvent, 'clientX' | 'clientY'>,
    ): { x: number; y: number };
    observeResize(canvas: HTMLCanvasElement, callback: () => void): () => void;
}

export const BROWSER = new InjectionToken<IBrowser>('BROWSER', {
    providedIn: 'root',
    factory: () => ({
        requestAnimationFrame: callback => window.requestAnimationFrame(callback),
        cancelAnimationFrame: id => window.cancelAnimationFrame(id),
        getContext: canvas => canvas.getContext('2d'),
        displayedWidth: canvas => canvas.clientWidth,
        displayedHeight: canvas => canvas.clientHeight,
        devicePixelRatio: () => window.devicePixelRatio,
        canvasPoint: (canvas, event) => {
            const bounds = canvas.getBoundingClientRect();
            if (bounds.width <= 0 || bounds.height <= 0) {
                throw new Error('Unable to convert canvas pointer: canvas has no rendered area.');
            }
            return {
                x: (event.clientX - bounds.left) * canvas.offsetWidth / bounds.width - canvas.clientLeft,
                y: (event.clientY - bounds.top) * canvas.offsetHeight / bounds.height - canvas.clientTop,
            };
        },
        observeResize: (canvas, callback) => {
            const observer = new ResizeObserver(callback);
            observer.observe(canvas);
            window.addEventListener('resize', callback);
            return () => {
                observer.disconnect();
                window.removeEventListener('resize', callback);
            };
        },
    }),
});
