import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { CanvasDiagramEditor } from './canvas-diagram-editor.component';
import { CANVAS } from './canvas';
import type { ICanvas } from './canvas';
import { SCHEDULER } from '../../scheduler';
import type { IScheduler } from '../../scheduler';

class MockScheduler implements IScheduler {
    interval: number | undefined;
    private callback: (() => void) | undefined;

    every(milliseconds: number, callback: () => void): () => void {
        this.interval = milliseconds;
        this.callback = callback;
        return () => { this.callback = undefined; };
    }

    tick(): void { this.callback?.(); }
}

class MockCanvas implements ICanvas {
    width = 320;
    height = 180;
    error = '';
    destroyed = false;
    requests = 0;
    draws: [string, number, number][] = [];
    boxes: number[][] = [];
    borders: number[] = [];
    captured: number[] = [];
    element: HTMLCanvasElement | undefined;
    private render: Parameters<ICanvas['initialize']>[1] | undefined;
    private pending = false;
    private readonly context = {
        fillText: (text: string, x: number, y: number) => { this.draws.push([text, x, y]); },
        strokeRect: (x: number, y: number, width: number, height: number) => {
            this.boxes.push([x, y, width, height]);
            this.borders.push(this.context.lineWidth);
        },
        textAlign: 'center' as const,
        textBaseline: 'middle' as const,
        font: '',
        lineWidth: 1,
    };

    initialize(element: HTMLCanvasElement, render: Parameters<ICanvas['initialize']>[1]): void {
        if (this.error) {
            throw new Error(this.error);
        }
        this.element = element;
        this.render = render;
        this.requestDraw();
    }
    requestDraw(): void { this.requests++; this.pending = true; }
    paint(): void {
        if (this.pending && this.render) {
            this.pending = false;
            this.render(this.context, this.width, this.height);
        }
    }
    point(event: Pick<MouseEvent, 'clientX' | 'clientY'>) {
        return { x: event.clientX - 101, y: event.clientY - 51 };
    }
    capturePointer(pointerId: number): void { this.captured.push(pointerId); }
    destroy(): void { this.destroyed = true; this.render = undefined; this.pending = false; }
}

describe('CanvasDiagramEditor', () => {
    let surface: MockCanvas;
    let scheduler: MockScheduler;

    beforeEach(() => {
        surface = new MockCanvas();
        scheduler = new MockScheduler();
        TestBed.configureTestingModule({
            imports: [CanvasDiagramEditor],
            providers: [{ provide: SCHEDULER, useValue: scheduler }],
        });
        TestBed.overrideComponent(CanvasDiagramEditor, {
            set: { providers: [{ provide: CANVAS, useValue: surface }] },
        });
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('supplies centered clock content and invalidates it once per second', () => {
        const fixture = TestBed.createComponent(CanvasDiagramEditor);
        fixture.detectChanges();
        const initialTime = currentTime();
        surface.paint();
        expect(surface.element).toBe(fixture.nativeElement.querySelector('canvas'));
        expect([initialTime, currentTime()]).toContain(surface.draws.at(-1)?.[0]);
        expect(surface.draws.at(-1)?.slice(1)).toEqual([160, 90]);
        expect(scheduler.interval).toBe(1000);
        const requests = surface.requests;
        const draws = surface.draws.length;
        scheduler.tick();
        expect(surface.requests).toBe(requests + 1);
        surface.paint();
        expect(surface.draws).toHaveLength(draws + 1);
        surface.width = 240;
        surface.height = 135;
        surface.requestDraw();
        const resizedTime = currentTime();
        surface.paint();
        expect([resizedTime, currentTime()]).toContain(surface.draws.at(-1)?.[0]);
        expect(surface.draws.at(-1)?.slice(1)).toEqual([120, 67.5]);
    });

    it('creates independently labelled boxes through repeated Add part', () => {
        const fixture = TestBed.createComponent(CanvasDiagramEditor);
        fixture.detectChanges();
        const add: HTMLButtonElement = fixture.nativeElement.querySelector('[aria-label="Add part"]');
        add.click();
        fixture.detectChanges();
        surface.paint();
        expect(surface.boxes.at(-1)).toEqual([24, 24, 180, 80]);
        expect(surface.draws).toContainEqual(['Part 1', 114, 64]);
        expect(add.disabled).toBe(false);
        add.click();
        surface.paint();
        expect(surface.boxes.slice(-2)).toEqual([[24, 24, 180, 80], [48, 48, 180, 80]]);
        expect(surface.draws).toContainEqual(['Part 2', 138, 88]);
    });

    it('repeats the placement pattern without reusing identities and keeps drawing order when selecting an older part', () => {
        const fixture = TestBed.createComponent(CanvasDiagramEditor);
        fixture.detectChanges();
        const editor = fixture.componentInstance;
        for (let i = 0; i < 5; i++) {
            editor.addPart();
        }
        expect(editor.parts.map(part => part.id)).toEqual([1, 2, 3, 4, 5]);
        expect(editor.parts.map(part => part.position)).toEqual([
            { x: 24, y: 24 }, { x: 48, y: 48 }, { x: 72, y: 72 }, { x: 96, y: 96 }, { x: 24, y: 24 },
        ]);
        const canvas: HTMLCanvasElement = fixture.nativeElement.querySelector('canvas');
        canvas.dispatchEvent(pointer('pointerdown', 130, 80, 1));
        expect(editor.selectedPart).toBe(editor.parts[4]);
        canvas.dispatchEvent(pointer('pointerup', 130, 80, 1));
        editor.removeSelectedPart();
        canvas.dispatchEvent(pointer('pointerdown', 130, 80, 1));
        expect(editor.selectedPart).toBe(editor.parts[0]);
        surface.paint();
        expect(surface.draws.slice(-4).map(draw => draw[0])).toEqual(['Part 1', 'Part 2', 'Part 3', 'Part 4']);
        expect(surface.borders.slice(-4)).toEqual([3, 1, 1, 1]);
        expect(editor.parts.map(part => part.id)).toEqual([1, 2, 3, 4]);
    });

    it('selects, renames, drags without a jump, and deselects the box', () => {
        const fixture = TestBed.createComponent(CanvasDiagramEditor);
        fixture.detectChanges();
        fixture.componentInstance.addPart();
        fixture.detectChanges();
        const canvas: HTMLCanvasElement = fixture.nativeElement.querySelector('canvas');
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input[aria-label="Part label"]');
        expect(input.disabled).toBe(true);
        canvas.dispatchEvent(pointer('pointerdown', 135, 85, 1));
        fixture.detectChanges();
        expect(input.disabled).toBe(false);
        input.value = 'Client sketch';
        input.dispatchEvent(new Event('input'));
        canvas.dispatchEvent(pointer('pointermove', 155, 115, 2));
        expect(fixture.componentInstance.parts[0].position).toEqual({ x: 24, y: 24 });
        canvas.dispatchEvent(pointer('pointermove', 155, 115, 1));
        surface.paint();
        expect(surface.boxes.at(-1)).toEqual([44, 54, 180, 80]);
        expect(surface.draws).toContainEqual(['Client sketch', 134, 94]);
        expect(surface.captured).toEqual([1]);
        canvas.dispatchEvent(pointer('pointerup', 155, 115, 2));
        canvas.dispatchEvent(pointer('pointerup', 155, 115, 1));
        canvas.dispatchEvent(pointer('pointermove', 175, 135, 1));
        expect(fixture.componentInstance.parts[0].position).toEqual({ x: 44, y: 54 });
        canvas.dispatchEvent(pointer('pointerdown', 102, 52, 1));
        fixture.detectChanges();
        expect(input.disabled).toBe(true);
    });

    it.each(['pointercancel', 'lostpointercapture'])('stops a drag on %s and ignores unsupported starts', end => {
        const fixture = TestBed.createComponent(CanvasDiagramEditor);
        fixture.detectChanges();
        const canvas: HTMLCanvasElement = fixture.nativeElement.querySelector('canvas');
        fixture.componentInstance.renamePart('No box');
        canvas.dispatchEvent(pointer('pointerdown', 135, 85, 1));
        canvas.dispatchEvent(new MouseEvent('pointerdown', { button: 2 }));
        fixture.componentInstance.addPart();
        canvas.dispatchEvent(pointer('pointerdown', 135, 85, 1));
        canvas.dispatchEvent(pointer('pointerdown', 150, 100, 2));
        expect(surface.captured).toEqual([1]);
        canvas.dispatchEvent(pointer(end, 135, 85, 1));
        canvas.dispatchEvent(pointer('pointermove', 155, 115, 1));
        expect(fixture.componentInstance.parts[0].position).toEqual({ x: 24, y: 24 });
        for (const [x, y] of [[125, 75], [305, 155], [306, 155], [125, 156], [124, 75], [125, 74]]) {
            canvas.dispatchEvent(pointer('pointerdown', x, y, 1));
            canvas.dispatchEvent(pointer('pointerup', x, y, 1));
        }
        canvas.dispatchEvent(pointer('pointerdown', 135, 85, 1));
        canvas.dispatchEvent(pointer('pointerup', 135, 85, 1));
        fixture.componentInstance.renamePart('');
        expect(fixture.componentInstance.parts[0].label).toBe('');
    });

    it('selects the topmost overlap, edits and moves only it, then removes it and never reuses its identity', () => {
        const fixture = TestBed.createComponent(CanvasDiagramEditor);
        fixture.detectChanges();
        const editor = fixture.componentInstance;
        const canvas: HTMLCanvasElement = fixture.nativeElement.querySelector('canvas');
        const remove: HTMLButtonElement = fixture.nativeElement.querySelector('[aria-label="Remove selected part"]');
        expect(remove.disabled).toBe(true);
        editor.removeSelectedPart();
        editor.addPart();
        editor.addPart();
        const [first, second] = editor.parts;
        expect(first.id).not.toBe(second.id);
        canvas.dispatchEvent(pointer('pointerdown', 160, 110, 1));
        expect(editor.selectedPart).toBe(second);
        editor.renamePart('Same label');
        expect(first.label).toBe('Part 1');
        canvas.dispatchEvent(pointer('pointermove', 180, 130, 1));
        expect(first.position).toEqual({ x: 24, y: 24 });
        expect(second.position).toEqual({ x: 68, y: 68 });
        fixture.detectChanges();
        expect(remove.disabled).toBe(false);
        remove.click();
        fixture.detectChanges();
        expect(editor.parts).toEqual([first]);
        expect(editor.selectedPart).toBeUndefined();
        expect(remove.disabled).toBe(true);
        canvas.dispatchEvent(pointer('pointermove', 200, 150, 1));
        expect(second.position).toEqual({ x: 68, y: 68 });
        canvas.dispatchEvent(pointer('pointerdown', 160, 110, 1));
        expect(editor.selectedPart).toBe(first);
        canvas.dispatchEvent(pointer('pointerup', 160, 110, 1));
        editor.renamePart('Same label');
        editor.addPart();
        expect(editor.parts[1].id).toBeGreaterThan(second.id);
        expect(editor.parts[1].label).toBe('Part 3');
        const requests = surface.requests;
        canvas.dispatchEvent(pointer('pointerdown', 102, 52, 1));
        editor.renamePart('Must not rename');
        editor.removeSelectedPart();
        expect(first.label).toBe('Same label');
        expect(editor.parts).toHaveLength(2);
        expect(surface.requests).toBe(requests + 1);
    });

    it('propagates surface initialization errors and safely cleans up a failed view', () => {
        surface.error = 'Canvas unavailable';
        const fixture = TestBed.createComponent(CanvasDiagramEditor);
        expect(() => fixture.detectChanges()).toThrow('Canvas unavailable');
        expect(scheduler.interval).toBeUndefined();
        fixture.destroy();
        expect(surface.destroyed).toBe(true);
    });

    it('stops clock invalidation and destroys its surface on destruction', () => {
        const fixture = TestBed.createComponent(CanvasDiagramEditor);
        fixture.detectChanges();
        fixture.destroy();
        const requests = surface.requests;
        scheduler.tick();
        scheduler.tick();
        expect(surface.requests).toBe(requests);
        expect(surface.destroyed).toBe(true);
    });

    it('emits logical canvas coordinates for pointer movement', () => {
        const fixture = TestBed.createComponent(CanvasDiagramEditor);
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
