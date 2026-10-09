import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { InteractiveCanvasComponent } from './interactive-canvas.component';
import { BROWSER } from './browser';
import type { IBrowser } from './browser';

class MockBrowser implements IBrowser {
    width = 320;
    height = 180;
    pixelRatio = 2;
    resize = () => {};
    disconnected = false;
    draws: [string, number, number][] = [];
    transforms: unknown[][] = [];
    boxes: number[][] = [];
    captured: number[] = [];
    capturePointer(_canvas: HTMLCanvasElement, pointerId: number): void { this.captured.push(pointerId); }
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
        clearRect: () => {},
        setTransform: (...values: unknown[]) => { this.transforms.push(values); },
        fillText: (text, x, y) => { this.draws.push([text, x, y]); },
        strokeRect: (x, y, width, height) => { this.boxes.push([x, y, width, height]); },
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
    observeResize(_canvas: HTMLCanvasElement, callback: () => void): () => void {
        this.resize = callback;
        return () => { this.disconnected = true; this.resize = () => {}; };
    }
}

describe('InteractiveCanvasComponent', () => {
    let browser: MockBrowser;

    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2026-10-09T21:15:00+02:00'));
        browser = new MockBrowser();
        TestBed.configureTestingModule({
            imports: [InteractiveCanvasComponent],
            providers: [{ provide: BROWSER, useValue: browser }],
        });
    });

    afterEach(() => {
        TestBed.resetTestingModule();
        jest.useRealTimers();
    });

    it('renders current time and refreshes after one second', () => {
        const fixture = TestBed.createComponent(InteractiveCanvasComponent);
        fixture.detectChanges();
        browser.paint();
        expect(fixture.nativeElement.querySelector('canvas')).not.toBeNull();
        expect(browser.draws.at(-1)).toEqual([currentTime(), 160, 90]);
        const initialTime = browser.draws.at(-1)?.[0];
        jest.advanceTimersByTime(1000);
        browser.paint();
        expect(browser.draws.at(-1)?.[0]).toBe(currentTime());
        expect(browser.draws.at(-1)?.[0]).not.toBe(initialTime);
    });

    it('creates one labelled sketch box through Add part and prevents a second box in this slice', () => {
        const fixture = TestBed.createComponent(InteractiveCanvasComponent);
        fixture.detectChanges();
        browser.paint();
        const add: HTMLButtonElement = fixture.nativeElement.querySelector('[aria-label="Add part"]');
        expect(add).not.toBeNull();
        add.click();
        fixture.detectChanges();
        browser.paint();
        expect(browser.boxes.at(-1)).toEqual([24, 24, 180, 80]);
        expect(browser.draws).toContainEqual(['DevEnv client', 114, 64]);
        expect(add.disabled).toBe(true);
    });

    it('selects, renames, drags without a jump, and deselects the box', () => {
        const fixture = TestBed.createComponent(InteractiveCanvasComponent);
        fixture.detectChanges();
        fixture.componentInstance.addPart();
        fixture.detectChanges();
        const canvas: HTMLCanvasElement = fixture.nativeElement.querySelector('canvas');
        const editor: HTMLInputElement = fixture.nativeElement.querySelector('input[aria-label="Part label"]');
        expect(editor).not.toBeNull();
        expect(editor.disabled).toBe(true);
        canvas.dispatchEvent(pointer('pointerdown', 135, 85, 1));
        fixture.detectChanges();
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input[aria-label="Part label"]');
        expect(input).not.toBeNull();
        input.value = 'Client sketch';
        input.dispatchEvent(new Event('input'));
        canvas.dispatchEvent(pointer('pointermove', 155, 115, 2));
        expect(fixture.componentInstance.part?.position).toEqual({ x: 24, y: 24 });
        canvas.dispatchEvent(pointer('pointermove', 155, 115, 1));
        browser.paint();
        expect(browser.boxes.at(-1)).toEqual([44, 54, 180, 80]);
        expect(browser.draws).toContainEqual(['Client sketch', 134, 94]);
        expect(browser.captured).toEqual([1]);
        canvas.dispatchEvent(pointer('pointerup', 155, 115, 2));
        canvas.dispatchEvent(pointer('pointerup', 155, 115, 1));
        canvas.dispatchEvent(pointer('pointermove', 175, 135, 1));
        expect(fixture.componentInstance.part?.position).toEqual({ x: 44, y: 54 });
        canvas.dispatchEvent(pointer('pointerdown', 102, 52, 1));
        fixture.detectChanges();
        expect(input.disabled).toBe(true);
    });

    it.each(['pointercancel', 'lostpointercapture'])('stops a drag on %s and ignores unsupported starts', end => {
        const fixture = TestBed.createComponent(InteractiveCanvasComponent);
        fixture.detectChanges();
        const canvas: HTMLCanvasElement = fixture.nativeElement.querySelector('canvas');
        fixture.componentInstance.renamePart('No box');
        canvas.dispatchEvent(pointer('pointerdown', 135, 85, 1));
        canvas.dispatchEvent(new MouseEvent('pointerdown', { button: 2 }));
        fixture.componentInstance.addPart();
        canvas.dispatchEvent(pointer('pointerdown', 135, 85, 1));
        canvas.dispatchEvent(pointer('pointerdown', 150, 100, 2));
        expect(browser.captured).toEqual([1]);
        canvas.dispatchEvent(pointer(end, 135, 85, 1));
        canvas.dispatchEvent(pointer('pointermove', 155, 115, 1));
        expect(fixture.componentInstance.part?.position).toEqual({ x: 24, y: 24 });
        for (const [x, y] of [[125, 75], [305, 155], [306, 155], [125, 156], [124, 75], [125, 74]]) {
            canvas.dispatchEvent(pointer('pointerdown', x, y, 1));
            canvas.dispatchEvent(pointer('pointerup', x, y, 1));
        }
        fixture.componentInstance.renamePart('');
        expect(fixture.componentInstance.part?.label).toBe('');
    });

    it('reports an unavailable context and safely destroys the failed view', () => {
        browser.context = null;
        const fixture = TestBed.createComponent(InteractiveCanvasComponent);
        expect(() => fixture.detectChanges()).toThrow(
            'Unable to initialize canvas clock: 2D context is unavailable.',
        );
        fixture.destroy();
    });

    it('resizes the bitmap and centers drawing in CSS pixels at different densities', () => {
        const fixture = TestBed.createComponent(InteractiveCanvasComponent);
        fixture.detectChanges();
        browser.paint();
        const canvas: HTMLCanvasElement = fixture.nativeElement.querySelector('canvas');
        expect([canvas.width, canvas.height]).toEqual([640, 360]);
        expect(browser.transforms.at(-1)).toEqual([2, 0, 0, 2, 0, 0]);
        browser.width = 240;
        browser.height = 135;
        browser.resize();
        browser.paint();
        expect([canvas.width, canvas.height]).toEqual([480, 270]);
        expect(browser.draws.at(-1)).toEqual([currentTime(), 120, 67.5]);
        browser.pixelRatio = 1;
        browser.resize();
        browser.paint();
        expect([canvas.width, canvas.height]).toEqual([240, 135]);
        expect(browser.transforms.at(-1)).toEqual([1, 0, 0, 1, 0, 0]);
    });

    it('removes resize subscriptions and timer on destruction', () => {
        const fixture = TestBed.createComponent(InteractiveCanvasComponent);
        fixture.detectChanges();
        fixture.destroy();
        const count = browser.draws.length;
        browser.resize();
        jest.advanceTimersByTime(2000);
        expect(browser.draws).toHaveLength(count);
        expect(browser.disconnected).toBe(true);
        expect(browser.frames.size).toBe(0);
    });

    it('coalesces changes into one frame and does not start an idle render loop', () => {
        const fixture = TestBed.createComponent(InteractiveCanvasComponent);
        fixture.detectChanges();
        browser.resize();
        browser.resize();
        expect(browser.draws).toHaveLength(0);
        expect(browser.frames.size).toBe(1);
        browser.paint();
        expect(browser.draws).toHaveLength(1);
        expect(browser.frames.size).toBe(0);
        browser.resize();
        jest.advanceTimersByTime(1000);
        expect(browser.frames.size).toBe(1);
        browser.paint();
        expect(browser.draws).toHaveLength(2);
        fixture.destroy();
        expect(browser.frames.size).toBe(0);
    });

    it('emits logical canvas coordinates for pointer movement', () => {
        const fixture = TestBed.createComponent(InteractiveCanvasComponent);
        fixture.detectChanges();
        const points: { x: number; y: number }[] = [];
        fixture.componentInstance.pointerMoved.subscribe(point => points.push(point));
        const canvas: HTMLCanvasElement = fixture.nativeElement.querySelector('canvas');
        canvas.dispatchEvent(new MouseEvent('pointermove', { clientX: 261, clientY: 141 }));
        expect(points).toEqual([{ x: 160, y: 90 }]);
    });
});

function currentTime(): string {
    return new Date().toLocaleTimeString(undefined, {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
}

function pointer(type: string, clientX: number, clientY: number, pointerId: number): MouseEvent {
    const event = new MouseEvent(type, { clientX, clientY, button: 0 });
    Object.defineProperty(event, 'pointerId', { value: pointerId });
    return event;
}
