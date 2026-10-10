import { InjectionToken } from '@angular/core';

export type CanvasRenderContext = Pick<CanvasRenderingContext2D,
    'fillText' | 'strokeRect' | 'beginPath' | 'moveTo' | 'lineTo' | 'stroke'
    | 'lineWidth' | 'textAlign' | 'textBaseline' | 'font'
    | 'strokeStyle' | 'fillStyle' | 'save' | 'restore' | 'clip'>;

export interface ICanvas {
    initialize(
        element: HTMLCanvasElement,
        render: (
            context: CanvasRenderContext,
            width: number,
            height: number,
        ) => void,
    ): void;
    requestDraw(): void;
    point(event: Pick<MouseEvent, 'clientX' | 'clientY'>): { x: number; y: number };
    capturePointer(pointerId: number): void;
    destroy(): void;
}

export const CANVAS = new InjectionToken<ICanvas>('CANVAS');
