import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { BROWSER } from './browser';

describe('IBrowser adapter', () => {
    const originalObserver = globalThis.ResizeObserver;

    afterEach(() => {
        TestBed.resetTestingModule();
        jest.restoreAllMocks();
        globalThis.ResizeObserver = originalObserver;
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

    it('subscribes to element and window resize and cleans up both', () => {
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
        stop();
        expect(disconnected).toBe(true);
        window.dispatchEvent(new Event('resize'));
        expect(notifications).toBe(2);
    });
});
