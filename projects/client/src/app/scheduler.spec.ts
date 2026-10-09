import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { SCHEDULER } from './scheduler';

describe('IScheduler adapter', () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    it('delivers recurring callbacks only after each interval and cancels future delivery', () => {
        jest.useFakeTimers();
        let ticks = 0;
        const cancel = TestBed.inject(SCHEDULER).every(30_000, () => { ticks++; });
        expect(ticks).toBe(0);
        jest.advanceTimersByTime(29_999);
        expect(ticks).toBe(0);
        jest.advanceTimersByTime(1);
        expect(ticks).toBe(1);
        jest.advanceTimersByTime(30_000);
        expect(ticks).toBe(2);
        cancel();
        jest.advanceTimersByTime(60_000);
        expect(ticks).toBe(2);
        cancel();
    });
});
