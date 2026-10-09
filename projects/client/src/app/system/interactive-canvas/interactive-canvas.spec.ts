import { describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { BROWSER } from './browser';
import type { IBrowser } from './browser';
import { InteractiveCanvas } from './interactive-canvas';

class MockBrowser implements IBrowser {
    width = 320;
    height = 180;
    pixelRatio = 2;
    resize = () => {};
    disconnected = false;
    transforms: unknown[][] = [];
    cleared: number[][] = [];
    captured: number[] = [];
    frames = new Map<number, () => void>();
    private nextFrame = 0;
    requestAnimationFrame(callback: () => void): number {
        const id = this.nextFrame++;
        this.frames.set(id, callback);
        return id;
    }
    cancelAnimationFrame(id: number): void { this.frames.delete(id); }
    paint(): void {
        const callbacks = [...this.frames.values()];
        this.frames.clear();
        callbacks.forEach(callback => callback());
    }
    context: ReturnType<IBrowser['getContext']> = {
        clearRect: (...values) => { this.cleared.push(values); },
        setTransform: (...values: unknown[]) => { this.transforms.push(values); },
        fillText: () => {},
        strokeRect: () => {},
        beginPath: () => {}, moveTo: () => {}, lineTo: () => {}, stroke: () => {},
        textAlign: 'center',
        textBaseline: 'middle',
        font: '',
        lineWidth: 1,
    };
    getContext(): ReturnType<IBrowser['getContext']> { return this.context; }
    displayedWidth(): number { return this.width; }
    displayedHeight(): number { return this.height; }
    devicePixelRatio(): number { return this.pixelRatio; }
    canvasPoint(_canvas: HTMLCanvasElement, event: Pick<MouseEvent, 'clientX' | 'clientY'>) {
        return { x: event.clientX - 101, y: event.clientY - 51 };
    }
    capturePointer(_canvas: HTMLCanvasElement, id: number): void { this.captured.push(id); }
    observeResize(_canvas: HTMLCanvasElement, callback: () => void): () => void {
        this.resize = callback;
        return () => { this.disconnected = true; this.resize = () => {}; };
    }
}

describe('InteractiveCanvas surface', () => {
    function setup() {
        const browser = new MockBrowser();
        TestBed.configureTestingModule({
            providers: [InteractiveCanvas, { provide: BROWSER, useValue: browser }],
        });
        return { browser, surface: TestBed.inject(InteractiveCanvas), element: document.createElement('canvas') };
    }

    it('sizes, clears and transforms the bitmap before rendering content in logical pixels', () => {
        const { browser, surface, element } = setup();
        const sizes: number[][] = [];
        surface.initialize(element, (_context, width, height) => { sizes.push([width, height]); });
        expect([element.width, element.height]).toEqual([640, 360]);
        browser.paint();
        expect(browser.transforms.at(-1)).toEqual([2, 0, 0, 2, 0, 0]);
        expect(browser.cleared.at(-1)).toEqual([0, 0, 320, 180]);
        expect(sizes).toEqual([[320, 180]]);
        browser.width = 240;
        browser.height = 135;
        browser.pixelRatio = 1;
        browser.resize();
        browser.paint();
        expect([element.width, element.height]).toEqual([240, 135]);
        expect(sizes.at(-1)).toEqual([240, 135]);
        expect(browser.transforms.at(-1)).toEqual([1, 0, 0, 1, 0, 0]);
        surface.destroy();
    });

    it('coalesces redraws without an idle loop and cancels a pending frame including ID zero', () => {
        const { browser, surface, element } = setup();
        let draws = 0;
        surface.initialize(element, () => { draws++; });
        surface.requestDraw();
        browser.resize();
        expect(browser.frames.size).toBe(1);
        surface.destroy();
        expect(browser.frames.size).toBe(0);
        expect(browser.disconnected).toBe(true);
        surface.initialize(element, () => { draws++; });
        browser.paint();
        expect(draws).toBe(1);
        expect(browser.frames.size).toBe(0);
        surface.requestDraw();
        browser.paint();
        expect(draws).toBe(2);
        surface.destroy();
        browser.resize();
        expect(browser.frames.size).toBe(0);
    });

    it('converts points and captures pointers through the browser boundary', () => {
        const { browser, surface, element } = setup();
        surface.initialize(element, () => {});
        expect(surface.point({ clientX: 261, clientY: 141 })).toEqual({ x: 160, y: 90 });
        surface.capturePointer(7);
        expect(browser.captured).toEqual([7]);
        surface.destroy();
    });

    it('reports invalid lifecycle use and an unavailable context while allowing safe cleanup', () => {
        const { browser, surface, element } = setup();
        expect(() => surface.requestDraw()).toThrow('Canvas is not initialized.');
        surface.destroy();
        browser.context = null;
        expect(() => surface.initialize(element, () => {})).toThrow('Unable to initialize canvas: 2D context is unavailable.');
        surface.destroy();
        browser.context = {
            clearRect: () => {}, setTransform: () => {}, fillText: () => {}, strokeRect: () => {},
            beginPath: () => {}, moveTo: () => {}, lineTo: () => {}, stroke: () => {},
            textAlign: 'center', textBaseline: 'middle', font: '', lineWidth: 1,
        };
        surface.initialize(element, () => {});
        expect(() => surface.initialize(element, () => {})).toThrow('Canvas is already initialized.');
        surface.destroy();
        expect(() => surface.point({ clientX: 0, clientY: 0 })).toThrow('Canvas is not initialized.');
    });
});
