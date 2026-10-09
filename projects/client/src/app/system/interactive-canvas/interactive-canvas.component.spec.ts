import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InteractiveCanvasComponent } from './interactive-canvas.component';

describe('InteractiveCanvasComponent', () => {
    let fixture: ComponentFixture<InteractiveCanvasComponent>;
    let drawnText: string[];

    beforeEach(async () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2026-10-09T21:15:00+02:00'));
        drawnText = [];
        await TestBed.configureTestingModule({
            imports: [InteractiveCanvasComponent],
        }).compileComponents();
        fixture = TestBed.createComponent(InteractiveCanvasComponent);
    });

    afterEach(() => {
        fixture.destroy();
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    it('renders the current time onto an HTML canvas', () => {
        const canvas = fixture.nativeElement.querySelector('canvas') as HTMLCanvasElement;
        jest.spyOn(canvas, 'getContext').mockReturnValue(createContext(drawnText));
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('canvas')).not.toBeNull();
        expect(drawnText).toContain(currentTime());
    });

    it('refreshes the rendered time after one second', () => {
        const canvas = fixture.nativeElement.querySelector('canvas') as HTMLCanvasElement;
        jest.spyOn(canvas, 'getContext').mockReturnValue(createContext(drawnText));
        fixture.detectChanges();
        const initialTime = drawnText.at(-1);

        jest.advanceTimersByTime(1000);

        expect(drawnText.at(-1)).toBe(currentTime());
        expect(drawnText.at(-1)).not.toBe(initialTime);
    });

    it('reports when the browser cannot provide a 2D canvas context', () => {
        const canvas = fixture.nativeElement.querySelector('canvas') as HTMLCanvasElement;
        jest.spyOn(canvas, 'getContext').mockReturnValue(null);

        expect(() => fixture.detectChanges()).toThrow(
            'Unable to initialize canvas clock: 2D context is unavailable.',
        );
    });
});

function createContext(drawnText: string[]): CanvasRenderingContext2D {
    return {
        clearRect: () => undefined,
        fillText: (text: string) => drawnText.push(text),
    } as unknown as CanvasRenderingContext2D;
}

function currentTime(): string {
    return new Date().toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}
