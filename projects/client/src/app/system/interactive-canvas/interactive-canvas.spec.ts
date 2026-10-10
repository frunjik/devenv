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
        strokeStyle: '', fillStyle: '', save: () => {}, restore: () => {}, clip: () => {},
        setLineDash: () => {},
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

    it('zooms around the pointer on Ctrl+wheel without changing logical rendering dimensions', () => {
        const { browser, surface, element } = setup();
        const sizes: number[][] = [];
        surface.initialize(element, (_context, width, height) => { sizes.push([width, height]); }, true);
        const event = new WheelEvent('wheel', {
            ctrlKey: true, deltaY: -100, clientX: 261, clientY: 141, cancelable: true,
        });
        element.dispatchEvent(event);
        expect(event.defaultPrevented).toBe(true);
        browser.paint();
        const zoom = Math.exp(.2);
        const transform = browser.transforms.at(-1)!;
        [2 * zoom, 0, 0, 2 * zoom, 320 * (1 - zoom), 180 * (1 - zoom)]
            .forEach((value, index) => expect(transform[index]).toBeCloseTo(value, 10));
        expect(surface.point({ clientX: 261, clientY: 141 })).toEqual({ x: 160, y: 90 });
        expect(sizes).toEqual([[320, 180]]);
        surface.destroy();
    });

    it('leaves ordinary scrolling and preview Ctrl-wheel untouched and removes its listener on destruction', () => {
        const { browser, surface, element } = setup();
        surface.initialize(element, () => {});
        const previewWheel = new WheelEvent('wheel', { ctrlKey: true, deltaY: -100, cancelable: true });
        element.dispatchEvent(previewWheel);
        expect(previewWheel.defaultPrevented).toBe(false);
        surface.destroy();
        surface.initialize(element, () => {}, true);
        const ordinaryWheel = new WheelEvent('wheel', { deltaY: 100, cancelable: true });
        element.dispatchEvent(ordinaryWheel);
        expect(ordinaryWheel.defaultPrevented).toBe(false);
        surface.destroy();
        const removedWheel = new WheelEvent('wheel', { ctrlKey: true, deltaY: -100, cancelable: true });
        element.dispatchEvent(removedWheel);
        expect(removedWheel.defaultPrevented).toBe(false);
        expect(browser.frames.size).toBe(0);
    });

    it.each([[1, -1, 16], [2, -1, 180], [0, -16, 16]])(
        'normalizes wheel mode %s with delta %s', (deltaMode, deltaY, pixels) => {
            const { browser, surface, element } = setup();
            surface.initialize(element, () => {}, true);
            element.dispatchEvent(new WheelEvent('wheel', { ctrlKey: true, deltaMode, deltaY, clientX: 101, clientY: 51 }));
            browser.paint();
            expect(browser.transforms.at(-1)?.[0]).toBeCloseTo(2 * Math.exp(pixels * .002), 10);
            surface.destroy();
        },
    );

    it('clamps zoom to 25%-400% and keeps anchors stable at limits', () => {
        const { browser, surface, element } = setup();
        surface.initialize(element, () => {}, true);
        for (const [deltaY, zoom] of [[-100000, 4], [100000, .25], [100000, .25]]) {
            element.dispatchEvent(new WheelEvent('wheel', { ctrlKey: true, deltaY, clientX: 261, clientY: 141 }));
            browser.paint();
            expect(browser.transforms.at(-1)?.[0]).toBe(2 * zoom);
            expect(surface.point({ clientX: 261, clientY: 141 })).toEqual({ x: 160, y: 90 });
        }
        surface.destroy();
    });

    it('pans freely, inverts the combined transform and preserves it across high-DPI resize', () => {
        const { browser, surface, element } = setup();
        surface.initialize(element, () => {}, true);
        element.dispatchEvent(new WheelEvent('wheel', { ctrlKey: true, deltaY: -100000, clientX: 101, clientY: 51 }));
        const pointer = (pointerId: number, clientX: number, clientY: number) =>
            ({ pointerId, clientX, clientY } as PointerEvent);
        expect(surface.movePan(pointer(1, 10, 10))).toBe(false);
        surface.beginPan(pointer(7, 100, 100));
        expect(browser.captured).toEqual([7]);
        expect(surface.movePan(pointer(8, 1000, 2000))).toBe(false);
        surface.endPan(pointer(8, 0, 0));
        expect(surface.movePan(pointer(7, 1100, -900))).toBe(true);
        expect(surface.point({ clientX: 1261, clientY: -589 })).toEqual({ x: 40, y: 90 });
        browser.pixelRatio = 3;
        browser.width = 640;
        browser.resize();
        browser.paint();
        expect(browser.transforms.at(-1)).toEqual([12, 0, 0, 12, 3000, -3000]);
        expect(browser.cleared.at(-1)).toEqual([0, 0, 640, 180]);
        surface.endPan(pointer(7, 0, 0));
        expect(surface.movePan(pointer(7, 2000, 2000))).toBe(false);
        surface.resetView();
        browser.paint();
        expect(browser.transforms.at(-1)).toEqual([3, 0, 0, 3, 0, 0]);
        expect(surface.point({ clientX: 261, clientY: 141 })).toEqual({ x: 160, y: 90 });
        surface.destroy();
    });

    it('reports invalid lifecycle use and an unavailable context while allowing safe cleanup', () => {
        const { browser, surface, element } = setup();
        expect(() => surface.requestDraw()).toThrow('Canvas is not initialized.');
        surface.destroy();
        const context = browser.context;
        browser.context = null;
        expect(() => surface.initialize(element, () => {})).toThrow('Unable to initialize canvas: 2D context is unavailable.');
        surface.destroy();
        browser.context = context;
        surface.initialize(element, () => {});
        expect(() => surface.initialize(element, () => {})).toThrow('Canvas is already initialized.');
        surface.destroy();
        expect(() => surface.point({ clientX: 0, clientY: 0 })).toThrow('Canvas is not initialized.');
    });
});
