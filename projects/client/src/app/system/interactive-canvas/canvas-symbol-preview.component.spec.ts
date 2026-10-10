import { afterEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CanvasSymbolPreviewComponent } from './canvas-symbol-preview.component';
import { CANVAS, type ICanvas } from './canvas';
import { recordingCanvasContext } from './testing/recording-canvas-context';

class PreviewSurface implements ICanvas {
    width = 1000;
    height = 1000;
    error: unknown;
    destroyed = false;
    readonly drawing = recordingCanvasContext();
    render: Parameters<ICanvas['initialize']>[1] | undefined;
    initialize(_element: HTMLCanvasElement, render: Parameters<ICanvas['initialize']>[1]): void {
        if (this.error) throw this.error;
        this.render = render;
    }
    requestDraw(): void { this.render?.(this.drawing.context, this.width, this.height); }
    point(): { x: number; y: number } { return { x: 0, y: 0 }; }
    capturePointer(): void {}
    resetView(): void {}
    beginPan(): void {}
    movePan(): boolean { return false; }
    endPan(): void {}
    destroy(): void { this.destroyed = true; }
}

describe('canvas symbol preview', () => {
    afterEach(() => { TestBed.resetTestingModule(); });

    function setup(surface = new PreviewSurface()) {
        TestBed.configureTestingModule({ imports: [CanvasSymbolPreviewComponent], providers: [provideRouter([])] });
        TestBed.overrideComponent(CanvasSymbolPreviewComponent, {
            set: { providers: [{ provide: CANVAS, useValue: surface }] },
        });
        const fixture = TestBed.createComponent(CanvasSymbolPreviewComponent);
        fixture.detectChanges();
        return { fixture, surface, host: fixture.nativeElement as HTMLElement };
    }

    it.each([360, 1000])('renders the sample at %i pixels with accessible text and cleans up', width => {
        const { fixture, surface, host } = setup();
        surface.width = width;
        surface.requestDraw();
        expect(surface.drawing.operations.filter(op => op.name === 'fillText').map(op => op.args[0]))
            .toEqual(expect.arrayContaining(['Dev', 'Artifact:', 'Business role:', 'Product:', 'System software:']));
        expect(host.querySelector('canvas')?.getAttribute('aria-label')).toContain('architecture symbols');
        expect(host.textContent).toContain('Artifact');
        fixture.destroy();
        expect(surface.destroyed).toBe(true);
    });

    it.each([new Error('No canvas context'), 'No canvas context'])('shows initialization errors explicitly: %s', error => {
        const surface = new PreviewSurface();
        surface.error = error;
        const { fixture, host } = setup(surface);
        fixture.detectChanges();
        expect(host.querySelector('[role="alert"]')?.textContent).toContain('No canvas context');
    });

    it('shows rendering errors and allows the next successful draw to recover', () => {
        const { fixture, surface, host } = setup();
        surface.width = 0;
        surface.requestDraw();
        fixture.detectChanges();
        expect(host.querySelector('[role="alert"]')?.textContent).toContain('160');
        surface.width = 360;
        surface.requestDraw();
        fixture.detectChanges();
        expect(host.querySelector('[role="alert"]')).toBeNull();
    });

    it('surfaces non-Error drawing failures', () => {
        const { fixture, surface, host } = setup();
        surface.drawing.context.fillText = () => { throw 'Drawing failed'; };
        surface.requestDraw();
        fixture.detectChanges();
        expect(host.querySelector('[role="alert"]')?.textContent).toBe('Drawing failed');
    });
});
