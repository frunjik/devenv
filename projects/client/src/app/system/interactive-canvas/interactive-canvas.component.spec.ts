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
    context: ReturnType<IBrowser['getContext']> = {
        clearRect: () => {},
        setTransform: (...values: unknown[]) => { this.transforms.push(values); },
        fillText: (text, x, y) => { this.draws.push([text, x, y]); },
        textAlign: 'center',
        textBaseline: 'middle',
        font: '',
    };
    getContext(): ReturnType<IBrowser['getContext']> { return this.context; }
    displayedWidth(): number { return this.width; }
    displayedHeight(): number { return this.height; }
    devicePixelRatio(): number { return this.pixelRatio; }
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
        expect(fixture.nativeElement.querySelector('canvas')).not.toBeNull();
        expect(browser.draws.at(-1)).toEqual([currentTime(), 160, 90]);
        const initialTime = browser.draws.at(-1)?.[0];
        jest.advanceTimersByTime(1000);
        expect(browser.draws.at(-1)?.[0]).toBe(currentTime());
        expect(browser.draws.at(-1)?.[0]).not.toBe(initialTime);
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
        const canvas: HTMLCanvasElement = fixture.nativeElement.querySelector('canvas');
        expect([canvas.width, canvas.height]).toEqual([640, 360]);
        expect(browser.transforms.at(-1)).toEqual([2, 0, 0, 2, 0, 0]);
        browser.width = 240;
        browser.height = 135;
        browser.resize();
        expect([canvas.width, canvas.height]).toEqual([480, 270]);
        expect(browser.draws.at(-1)).toEqual([currentTime(), 120, 67.5]);
        browser.pixelRatio = 1;
        browser.resize();
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
    });
});

function currentTime(): string {
    return new Date().toLocaleTimeString(undefined, {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
}
