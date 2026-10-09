import { InjectionToken } from '@angular/core';

export interface IBrowser {
    getContext(canvas: HTMLCanvasElement): Pick<CanvasRenderingContext2D,
        'clearRect' | 'setTransform' | 'fillText' | 'textAlign' | 'textBaseline' | 'font'> | null;
    displayedWidth(canvas: HTMLCanvasElement): number;
    displayedHeight(canvas: HTMLCanvasElement): number;
    devicePixelRatio(): number;
    observeResize(canvas: HTMLCanvasElement, callback: () => void): () => void;
}

export const BROWSER = new InjectionToken<IBrowser>('BROWSER', {
    providedIn: 'root',
    factory: () => ({
        getContext: canvas => canvas.getContext('2d'),
        displayedWidth: canvas => canvas.clientWidth,
        displayedHeight: canvas => canvas.clientHeight,
        devicePixelRatio: () => window.devicePixelRatio,
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
