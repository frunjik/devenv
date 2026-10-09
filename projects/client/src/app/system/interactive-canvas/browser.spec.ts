import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { BROWSER } from './browser';

describe('IBrowser adapter', () => {
    const originalObserver = globalThis.ResizeObserver;
    const originalMatchMedia = Object.getOwnPropertyDescriptor(window, 'matchMedia');

    afterEach(() => {
        TestBed.resetTestingModule();
        jest.restoreAllMocks();
        globalThis.ResizeObserver = originalObserver;
        if (originalMatchMedia) {
            Object.defineProperty(window, 'matchMedia', originalMatchMedia);
        } else {
            Reflect.deleteProperty(window, 'matchMedia');
        }
    });

    it('delegates frame scheduling and cancellation to the browser', () => {
        const request = jest.spyOn(window, 'requestAnimationFrame').mockReturnValue(7);
        const cancel = jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
        const callback = () => {};
        const browser = TestBed.inject(BROWSER);
        expect(browser.requestAnimationFrame(callback)).toBe(7);
        expect(request).toHaveBeenCalledWith(callback);
        browser.cancelAnimationFrame(7);
        expect(cancel).toHaveBeenCalledWith(7);
    });

    it('delegates context and dimensions to the browser', () => {
        const canvas = document.createElement('canvas');
        const getContext = jest.spyOn(canvas, 'getContext').mockReturnValue(null);
        jest.spyOn(canvas, 'clientWidth', 'get').mockReturnValue(320);
        jest.spyOn(canvas, 'clientHeight', 'get').mockReturnValue(180);
        jest.replaceProperty(window, 'devicePixelRatio', 2);
        const browser = TestBed.inject(BROWSER);
        expect(browser.getContext(canvas)).toBeNull();
        expect(getContext).toHaveBeenCalledWith('2d');
        expect(browser.displayedWidth(canvas)).toBe(320);
        expect(browser.displayedHeight(canvas)).toBe(180);
        expect(browser.devicePixelRatio()).toBe(2);
    });

    it('converts viewport coordinates to logical CSS pixels, excluding the border', () => {
        const canvas = document.createElement('canvas');
        let bounds = rectangle(100, 50, 322, 182);
        jest.spyOn(canvas, 'getBoundingClientRect').mockImplementation(() => bounds);
        jest.spyOn(canvas, 'offsetWidth', 'get').mockReturnValue(322);
        jest.spyOn(canvas, 'offsetHeight', 'get').mockReturnValue(182);
        jest.spyOn(canvas, 'clientLeft', 'get').mockReturnValue(1);
        jest.spyOn(canvas, 'clientTop', 'get').mockReturnValue(1);
        const browser = TestBed.inject(BROWSER);
        expect(browser.canvasPoint(canvas, { clientX: 261, clientY: 141 }))
            .toEqual({ x: 160, y: 90 });
        jest.replaceProperty(window, 'devicePixelRatio', 2);
        expect(browser.canvasPoint(canvas, { clientX: 261, clientY: 141 }))
            .toEqual({ x: 160, y: 90 });
        bounds = rectangle(20, 30, 644, 364);
        expect(browser.canvasPoint(canvas, { clientX: 342, clientY: 212 }))
            .toEqual({ x: 160, y: 90 });
        expect(browser.canvasPoint(canvas, { clientX: 20, clientY: 30 }))
            .toEqual({ x: -1, y: -1 });
    });

    it.each([
        rectangle(0, 0, 0, 180),
        rectangle(0, 0, 320, 0),
    ])('reports when pointer conversion has no rendered area', bounds => {
        const canvas = document.createElement('canvas');
        jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(bounds);
        expect(() => TestBed.inject(BROWSER).canvasPoint(canvas, { clientX: 0, clientY: 0 }))
            .toThrow('Unable to convert canvas pointer: canvas has no rendered area.');
    });

    function rectangle(x: number, y: number, width: number, height: number): DOMRect {
        return {
            x, y, width, height, left: x, top: y, right: x + width, bottom: y + height,
            toJSON: () => ({ x, y, width, height }),
        };
    }

    it('subscribes to element and window resize and cleans up both', () => {
        const queries: MediaQueryList[] = [];
        const matchMedia = jest.fn((media: string): MediaQueryList => {
            const events = new EventTarget();
            const query: MediaQueryList = {
                media, matches: true, onchange: null,
                addListener: () => {},
                removeListener: () => {},
                addEventListener: events.addEventListener.bind(events),
                removeEventListener: events.removeEventListener.bind(events),
                dispatchEvent: events.dispatchEvent.bind(events),
            };
            queries.push(query);
            return query;
        });
        Object.defineProperty(window, 'matchMedia', { configurable: true, value: matchMedia });
        jest.replaceProperty(window, 'devicePixelRatio', 1);
        let notify = () => {};
        let observed: Element | undefined;
        let disconnected = false;
        globalThis.ResizeObserver = class implements ResizeObserver {
            constructor(callback: ResizeObserverCallback) {
                notify = () => callback([], this);
            }
            observe(element: Element): void { observed = element; }
            unobserve(): void {}
            disconnect(): void { disconnected = true; }
        };
        const canvas = document.createElement('canvas');
        let notifications = 0;
        const stop = TestBed.inject(BROWSER).observeResize(canvas, () => notifications++);
        expect(observed).toBe(canvas);
        notify();
        window.dispatchEvent(new Event('resize'));
        expect(notifications).toBe(2);
        expect(matchMedia).toHaveBeenLastCalledWith('(resolution: 1dppx)');
        jest.replaceProperty(window, 'devicePixelRatio', 3);
        queries[0].dispatchEvent(new Event('change'));
        expect(notifications).toBe(3);
        expect(matchMedia).toHaveBeenLastCalledWith('(resolution: 3dppx)');
        queries[0].dispatchEvent(new Event('change'));
        expect(notifications).toBe(3);
        jest.replaceProperty(window, 'devicePixelRatio', 2);
        queries[1].dispatchEvent(new Event('change'));
        expect(notifications).toBe(4);
        expect(matchMedia).toHaveBeenLastCalledWith('(resolution: 2dppx)');
        stop();
        expect(disconnected).toBe(true);
        window.dispatchEvent(new Event('resize'));
        queries[2].dispatchEvent(new Event('change'));
        expect(notifications).toBe(4);
    });
});
