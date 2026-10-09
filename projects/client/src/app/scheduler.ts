import { InjectionToken } from '@angular/core';

export interface IScheduler {
    every(milliseconds: number, callback: () => void): () => void;
}

export const SCHEDULER = new InjectionToken<IScheduler>('SCHEDULER', {
    providedIn: 'root',
    factory: () => ({
        every: (milliseconds, callback) => {
            const timer = setInterval(callback, milliseconds);
            return () => clearInterval(timer);
        },
    }),
});
