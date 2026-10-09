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
    textWidths: (number | undefined)[] = [];
    boxes: number[][] = [];
    borders: number[] = [];
    paths: number[][][] = [];
    lineWidths: number[] = [];
    operations: string[] = [];
    captured: number[] = [];
    element: HTMLCanvasElement | undefined;
    private render: Parameters<ICanvas['initialize']>[1] | undefined;
    private pending = false;
    private readonly context = {
        fillText: (text: string, x: number, y: number, maxWidth?: number) => {
            this.draws.push([text, x, y]);
            this.textWidths.push(maxWidth);
        },
        strokeRect: (x: number, y: number, width: number, height: number) => {
            this.operations.push('box');
            this.boxes.push([x, y, width, height]);
            this.borders.push(this.context.lineWidth);
        },
        beginPath: () => { this.paths.push([]); },
        moveTo: (x: number, y: number) => { this.paths.at(-1)?.push([x, y]); },
        lineTo: (x: number, y: number) => { this.paths.at(-1)?.push([x, y]); },
        stroke: () => { this.operations.push('line'); this.lineWidths.push(this.context.lineWidth); },
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

    it('loads the six explanatory DevEnv parts and editable connections through the overview button', () => {
        const fixture = TestBed.createComponent(CanvasDiagramEditor);
        fixture.detectChanges();
        const button: HTMLButtonElement = fixture.nativeElement.querySelector('[aria-label="Load DevEnv overview"]');
        button.click();
        fixture.detectChanges();
        const editor = fixture.componentInstance;
        expect(editor.parts.map(part => part.label)).toEqual([
            'People / product team', 'Goals & intended outcomes', 'Problems & inquiry',
            'Knowledge & decisions', 'Work & changes', 'Evidence & learning',
        ]);
        expect(editor.connections.map(connection => [
            connection.first.label, connection.second.label, connection.label,
        ])).toEqual([
            ['People / product team', 'Goals & intended outcomes', 'defines'],
            ['Goals & intended outcomes', 'Problems & inquiry', 'focuses inquiry'],
            ['Problems & inquiry', 'Knowledge & decisions', 'informs'],
            ['Knowledge & decisions', 'Work & changes', 'guides'],
            ['Work & changes', 'Evidence & learning', 'produces'],
            ['Evidence & learning', 'People / product team', 'supports learning'],
        ]);
        expect(new Set(editor.parts.map(part => part.id)).size).toBe(6);
        expect(fixture.nativeElement.textContent).toContain('Explanatory sketch');
        expect(fixture.nativeElement.querySelector('.canvas-viewport').classList.contains('overview-workspace')).toBe(true);
        surface.paint();
        expect(surface.boxes.slice(-6)).toEqual([
            [40, 40, 180, 80], [340, 40, 180, 80], [640, 40, 180, 80],
            [640, 320, 180, 80], [340, 320, 180, 80], [40, 320, 180, 80],
        ]);
        expect(surface.textWidths.slice(-6)).toEqual([164, 164, 164, 164, 164, 164]);
    });

    it('requires explicit replacement confirmation, preserves cancelled work and resets interaction references on reload', () => {
        const fixture = TestBed.createComponent(CanvasDiagramEditor);
        fixture.detectChanges();
        const editor = fixture.componentInstance;
        const host: HTMLElement = fixture.nativeElement;
        const canvas = host.querySelector('canvas')!;
        const click = (label: string) => {
            host.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!.click();
            fixture.detectChanges();
        };
        editor.editLabel('My preserved draft');
        editor.addPart();
        canvas.dispatchEvent(pointer('pointerdown', 130, 80, 1));
        const originalPart = editor.parts[0];
        click('Load DevEnv overview');
        expect(editor.parts).toEqual([originalPart]);
        expect(editor.selectedPart).toBe(originalPart);
        expect(host.textContent).toContain('Replace the current sketch?');
        click('Cancel replacement');
        expect(editor.parts).toEqual([originalPart]);
        expect(editor.selectedPart).toBe(originalPart);
        expect(host.querySelector('[aria-label="Confirm replacement"]')).toBeNull();
        click('Load DevEnv overview');
        click('Confirm replacement');
        expect(editor.selectedPart).toBeUndefined();
        expect(editor.selectedConnection).toBeUndefined();
        expect(editor.labelValue).toBe('My preserved draft');
        canvas.dispatchEvent(pointer('pointermove', 800, 400, 1));
        expect(originalPart.position).toEqual({ x: 24, y: 24 });
        expect(editor.parts.every(part => part.id > originalPart.id)).toBe(true);
        const firstParts = editor.parts;
        const firstConnections = editor.connections;
        canvas.dispatchEvent(pointer('pointerdown', 160, 110, 2));
        editor.startConnection();
        click('Load DevEnv overview');
        click('Cancel replacement');
        expect(editor.connectionSource).toBe(firstParts[0]);
        click('Load DevEnv overview');
        click('Confirm replacement');
        expect(editor.connectionSource).toBeUndefined();
        expect(editor.connectionMessage).toBe('');
        expect(editor.parts.every(part => part.id > firstParts[5].id)).toBe(true);
        expect(editor.connections.every(connection =>
            connection.id > firstConnections[5].id
            && editor.parts.includes(connection.first) && editor.parts.includes(connection.second))).toBe(true);
        canvas.dispatchEvent(pointer('pointerdown', 390, 131, 3));
        expect(editor.selectedConnection).toBe(editor.connections[0]);
        editor.editLabel('Edited overview link');
        expect(editor.connections[0].label).toBe('Edited overview link');
        click('Load DevEnv overview');
        click('Confirm replacement');
        expect(editor.selectedConnection).toBeUndefined();
        expect(editor.connections[0].label).toBe('defines');
        expect(editor.labelValue).toBe('My preserved draft');
    });

    it('picks multiple connections independently of canvas selection and deletes only the checked lines', () => {
        const fixture = TestBed.createComponent(CanvasDiagramEditor);
        fixture.detectChanges();
        const editor = fixture.componentInstance;
        editor.loadOverview();
        const host: HTMLElement = fixture.nativeElement;
        const canvas = host.querySelector('canvas')!;
        canvas.dispatchEvent(pointer('pointerdown', 390, 131, 1));
        fixture.detectChanges();
        const selected = editor.selectedConnection;
        const retained = editor.connections.slice(2);
        const picker = host.querySelector<HTMLDetailsElement>('.connection-picker')!;
        expect(picker.open).toBe(false);
        const remove = host.querySelector<HTMLButtonElement>('[aria-label="Delete selected connections"]')!;
        expect(remove.disabled).toBe(true);
        const checks = host.querySelectorAll<HTMLInputElement>('.connection-picker input[type="checkbox"]');
        expect(checks).toHaveLength(6);
        checks[0].click();
        checks[1].click();
        fixture.detectChanges();
        expect(editor.selectedConnection).toBe(selected);
        expect(editor.labelPurpose).toBe('Connection label');
        expect(remove.disabled).toBe(false);
        expect(host.querySelectorAll('.connection-controls button')).toHaveLength(1);
        remove.click();
        fixture.detectChanges();
        expect(editor.connections).toEqual(retained);
        expect(editor.selectedConnection).toBeUndefined();
        expect(remove.disabled).toBe(true);
        expect(host.querySelectorAll('.connection-picker input:checked')).toHaveLength(0);
    });

    it('unchecks without deletion and discards stale checked connections after individual removal, part removal and replacement', () => {
        const fixture = TestBed.createComponent(CanvasDiagramEditor);
        fixture.detectChanges();
        const editor = fixture.componentInstance;
        const host: HTMLElement = fixture.nativeElement;
        editor.loadOverview();
        fixture.detectChanges();
        const check = host.querySelector<HTMLInputElement>('.connection-picker input')!;
        check.click();
        check.click();
        fixture.detectChanges();
        expect(editor.checkedConnections.size).toBe(0);
        expect(editor.connections).toHaveLength(6);
        editor.checkConnection(editor.connections[0], true);
        editor.removeConnection(editor.connections[0]);
        expect(editor.checkedConnections.size).toBe(0);
        editor.checkConnection(editor.connections[0], true);
        const retained = editor.connections[1];
        editor.checkConnection(retained, true);
        const canvas = host.querySelector('canvas')!;
        canvas.dispatchEvent(pointer('pointerdown', 460, 110, 1));
        canvas.dispatchEvent(pointer('pointerup', 460, 110, 1));
        editor.removeSelectedPart();
        expect([...editor.checkedConnections]).toEqual([retained]);
        editor.loadOverview();
        editor.cancelOverview();
        expect([...editor.checkedConnections]).toEqual([retained]);
        editor.loadOverview();
        editor.confirmOverview();
        expect(editor.checkedConnections.size).toBe(0);
        fixture.detectChanges();
        expect(host.querySelectorAll('.connection-picker input:checked')).toHaveLength(0);
        expect(host.querySelector<HTMLButtonElement>('[aria-label="Delete selected connections"]')!.disabled).toBe(true);
    });

    it('uses the enabled label input as a preserved custom draft for adding parts', () => {
        const fixture = TestBed.createComponent(CanvasDiagramEditor);
        fixture.detectChanges();
        const input: HTMLInputElement = fixture.nativeElement.querySelector('.canvas-controls input');
        const add: HTMLButtonElement = fixture.nativeElement.querySelector('[aria-label="Add part"]');
        expect(input.disabled).toBe(false);
        expect(input.value).toBe('Part 1');
        input.value = 'DevEnv client';
        input.dispatchEvent(new Event('input'));
        add.click();
        add.click();
        fixture.detectChanges();
        expect(fixture.componentInstance.parts.map(part => part.label)).toEqual(['DevEnv client', 'DevEnv client']);
        expect(input.value).toBe('DevEnv client');
    });

    it('switches the single input between preserved draft, part and canvas-selected connection labels', () => {
        const fixture = TestBed.createComponent(CanvasDiagramEditor);
        fixture.detectChanges();
        const editor = fixture.componentInstance;
        const canvas: HTMLCanvasElement = fixture.nativeElement.querySelector('canvas');
        const input: HTMLInputElement = fixture.nativeElement.querySelector('.canvas-controls input');
        const add: HTMLButtonElement = fixture.nativeElement.querySelector('[aria-label="Add part"]');
        const click = (x: number, y: number) => {
            canvas.dispatchEvent(pointer('pointerdown', x + 101, y + 51, 1));
            canvas.dispatchEvent(pointer('pointerup', x + 101, y + 51, 1));
            fixture.detectChanges();
        };
        editor.addPart();
        editor.addPart();
        input.value = 'Next component';
        input.dispatchEvent(new Event('input'));
        click(29, 29);
        expect(input.getAttribute('aria-label')).toBe('Part label');
        expect(add.disabled).toBe(true);
        input.value = 'Client';
        input.dispatchEvent(new Event('input'));
        editor.startConnection();
        fixture.detectChanges();
        expect(input.disabled).toBe(true);
        editor.editLabel('Blocked');
        expect(editor.parts[0].label).toBe('Client');
        editor.addPart();
        expect(editor.parts).toHaveLength(2);
        click(59, 59);
        canvas.dispatchEvent(pointer('pointerdown', 160, 110, 1));
        canvas.dispatchEvent(pointer('pointermove', 460, 86, 1));
        canvas.dispatchEvent(pointer('pointerup', 460, 86, 1));
        click(276, 64);
        expect(editor.selectedConnection).toBe(editor.connections[0]);
        expect(editor.selectedPart).toBeUndefined();
        expect(input.getAttribute('aria-label')).toBe('Connection label');
        expect(input.value).toBe('');
        expect(input.disabled).toBe(false);
        input.value = 'uses';
        input.dispatchEvent(new Event('input'));
        expect(editor.connections[0].label).toBe('uses');
        surface.paint();
        expect(surface.lineWidths.at(-1)).toBe(3);
        expect(surface.borders.slice(-2)).toEqual([1, 1]);
        expect(fixture.nativeElement.querySelectorAll('input.form-control')).toHaveLength(1);
        const connect: HTMLButtonElement = fixture.nativeElement.querySelector('[aria-label="Connect selected part"]');
        expect(connect.disabled).toBe(true);
        editor.addPart();
        expect(editor.parts).toHaveLength(2);
        click(10, 10);
        expect(input.getAttribute('aria-label')).toBe('Label for next part');
        expect(input.value).toBe('Next component');
        expect(add.disabled).toBe(false);
        add.click();
        expect(editor.parts[2].label).toBe('Next component');
        click(276, 64);
        editor.removeConnection(editor.connections[0]);
        fixture.detectChanges();
        expect(editor.selectedConnection).toBeUndefined();
        expect(input.value).toBe('Next component');
        click(29, 29);
        editor.startConnection();
        fixture.detectChanges();
        expect(input.disabled).toBe(true);
        editor.cancelConnection();
        fixture.detectChanges();
        expect(input.disabled).toBe(false);
    });

    it('hit-tests the drawn segment within exactly six logical pixels, prioritizes parts, and never drags a selected line', () => {
        const fixture = TestBed.createComponent(CanvasDiagramEditor);
        fixture.detectChanges();
        const editor = fixture.componentInstance;
        editor.addPart();
        editor.addPart();
        const canvas: HTMLCanvasElement = fixture.nativeElement.querySelector('canvas');
        const click = (x: number, y: number) => {
            canvas.dispatchEvent(pointer('pointerdown', x + 101, y + 51, 1));
            canvas.dispatchEvent(pointer('pointerup', x + 101, y + 51, 1));
        };
        click(29, 29);
        editor.startConnection();
        click(59, 59);
        canvas.dispatchEvent(pointer('pointerdown', 160, 110, 1));
        canvas.dispatchEvent(pointer('pointermove', 460, 86, 1));
        canvas.dispatchEvent(pointer('pointerup', 460, 86, 1));
        click(276, 70);
        expect(editor.selectedConnection).toBe(editor.connections[0]);
        canvas.dispatchEvent(pointer('pointermove', 500, 160, 1));
        expect(editor.parts[1].position).toEqual({ x: 348, y: 24 });
        click(276, 70.01);
        expect(editor.selectedConnection).toBeUndefined();
        click(276, 58);
        expect(editor.selectedConnection).toBe(editor.connections[0]);
        click(114, 64);
        expect(editor.selectedPart).toBe(editor.parts[0]);
        expect(editor.selectedConnection).toBeUndefined();
        click(600, 64);
        expect(editor.selectedConnection).toBeUndefined();
        click(-20, 64);
        expect(editor.selectedConnection).toBeUndefined();
    });

    it('preserves empty custom drafts and labels through selection and removal', () => {
        const fixture = TestBed.createComponent(CanvasDiagramEditor);
        fixture.detectChanges();
        const editor = fixture.componentInstance;
        const canvas: HTMLCanvasElement = fixture.nativeElement.querySelector('canvas');
        editor.editLabel('');
        editor.addPart();
        expect(editor.parts[0].label).toBe('');
        canvas.dispatchEvent(pointer('pointerdown', 130, 80, 1));
        canvas.dispatchEvent(pointer('pointerup', 130, 80, 1));
        editor.editLabel('Temporary');
        editor.removeSelectedPart();
        expect(editor.labelValue).toBe('');
        editor.addPart();
        expect(editor.parts[0].label).toBe('');
    });

    it('selects the newest overlapping line and follows changed diagonal geometry', () => {
        const fixture = TestBed.createComponent(CanvasDiagramEditor);
        fixture.detectChanges();
        const editor = fixture.componentInstance;
        editor.addPart();
        editor.addPart();
        editor.addPart();
        const canvas: HTMLCanvasElement = fixture.nativeElement.querySelector('canvas');
        const click = (x: number, y: number) => {
            canvas.dispatchEvent(pointer('pointerdown', x + 101, y + 51, 1));
            canvas.dispatchEvent(pointer('pointerup', x + 101, y + 51, 1));
        };
        canvas.dispatchEvent(pointer('pointerdown', 160, 110, 1));
        canvas.dispatchEvent(pointer('pointermove', 460, 86, 1));
        canvas.dispatchEvent(pointer('pointerup', 460, 86, 1));
        click(29, 29);
        editor.startConnection();
        click(359, 35);
        canvas.dispatchEvent(pointer('pointerdown', 184, 134, 1));
        canvas.dispatchEvent(pointer('pointermove', 460, 86, 1));
        canvas.dispatchEvent(pointer('pointerup', 460, 86, 1));
        click(29, 29);
        editor.startConnection();
        click(359, 35);
        click(276, 64);
        expect(editor.selectedConnection).toBe(editor.connections[1]);
        editor.removeConnection(editor.connections[0]);
        expect(editor.selectedConnection).toBe(editor.connections[0]);
        canvas.dispatchEvent(pointer('pointerdown', 460, 86, 1));
        canvas.dispatchEvent(pointer('pointermove', 460, 286, 1));
        canvas.dispatchEvent(pointer('pointerup', 460, 286, 1));
        click(276, 164);
        expect(editor.selectedConnection).toBe(editor.connections[0]);
        click(276, 64);
        expect(editor.selectedConnection).toBeUndefined();
    });

    it('connects two selected endpoints without starting a destination drag', () => {
        const fixture = TestBed.createComponent(CanvasDiagramEditor);
        fixture.detectChanges();
        const editor = fixture.componentInstance;
        editor.addPart();
        editor.addPart();
        const canvas: HTMLCanvasElement = fixture.nativeElement.querySelector('canvas');
        canvas.dispatchEvent(pointer('pointerdown', 130, 80, 1));
        canvas.dispatchEvent(pointer('pointerup', 130, 80, 1));
        fixture.detectChanges();
        const connect: HTMLButtonElement = fixture.nativeElement.querySelector('[aria-label="Connect selected part"]');
        connect.click();
        canvas.dispatchEvent(pointer('pointerdown', 160, 110, 1));
        expect(editor.connections).toHaveLength(1);
        expect(editor.connections[0].first).toBe(editor.parts[0]);
        expect(editor.connections[0].second).toBe(editor.parts[1]);
        canvas.dispatchEvent(pointer('pointermove', 200, 150, 1));
        expect(editor.parts[1].position).toEqual({ x: 48, y: 48 });
    });

    it('reports invalid endpoints and duplicate undirected pairs, retains empty-click mode, and cancels explicitly', () => {
        const fixture = TestBed.createComponent(CanvasDiagramEditor);
        fixture.detectChanges();
        const editor = fixture.componentInstance;
        const canvas: HTMLCanvasElement = fixture.nativeElement.querySelector('canvas');
        editor.startConnection();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain('Select a part');
        editor.addPart();
        editor.addPart();
        canvas.dispatchEvent(pointer('pointerdown', 130, 80, 1));
        canvas.dispatchEvent(pointer('pointerup', 130, 80, 1));
        editor.startConnection();
        canvas.dispatchEvent(pointer('pointerdown', 102, 52, 1));
        expect(editor.connectionSource).toBe(editor.parts[0]);
        canvas.dispatchEvent(pointer('pointerdown', 130, 80, 1));
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain('different part');
        expect(editor.connections).toHaveLength(0);
        canvas.dispatchEvent(pointer('pointerdown', 160, 110, 1));
        canvas.dispatchEvent(pointer('pointerdown', 160, 110, 1));
        canvas.dispatchEvent(pointer('pointerup', 160, 110, 1));
        editor.startConnection();
        canvas.dispatchEvent(pointer('pointerdown', 130, 80, 1));
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain('already connected');
        expect(editor.connections).toHaveLength(1);
        canvas.dispatchEvent(pointer('pointerdown', 160, 110, 1));
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain('different part');
        const cancel: HTMLButtonElement = fixture.nativeElement.querySelector('[aria-label="Cancel connection"]');
        cancel.click();
        expect(editor.connectionSource).toBeUndefined();
        editor.startConnection();
        canvas.dispatchEvent(pointer('pointerdown', 130, 80, 1));
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain('already connected');
    });

    it('edits labels and removes connections through HTML controls, and removes incident connections with a part', () => {
        const fixture = TestBed.createComponent(CanvasDiagramEditor);
        fixture.detectChanges();
        const editor = fixture.componentInstance;
        editor.addPart();
        editor.addPart();
        editor.addPart();
        const canvas: HTMLCanvasElement = fixture.nativeElement.querySelector('canvas');
        const select = (x: number, y: number) => {
            canvas.dispatchEvent(pointer('pointerdown', x, y, 1));
            canvas.dispatchEvent(pointer('pointerup', x, y, 1));
        };
        select(130, 80);
        editor.startConnection();
        select(160, 110);
        const firstId = editor.connections[0].id;
        fixture.detectChanges();
        editor.renameConnection(editor.connections[0], 'uses');
        expect(editor.connections[0].label).toBe('uses');
        editor.renamePart('Client sketch');
        expect(editor.connections).toHaveLength(1);
        const check: HTMLInputElement = fixture.nativeElement.querySelector('.connection-picker input');
        check.click();
        fixture.detectChanges();
        const remove: HTMLButtonElement = fixture.nativeElement.querySelector('[aria-label="Delete selected connections"]');
        remove.click();
        expect(editor.connections).toHaveLength(0);
        select(130, 80);
        editor.startConnection();
        select(160, 110);
        expect(editor.connections[0].id).toBeGreaterThan(firstId);
        select(130, 80);
        editor.startConnection();
        select(185, 135);
        editor.removeConnection(editor.connections[1]);
        expect(editor.connections).toHaveLength(1);
        select(130, 80);
        editor.startConnection();
        select(185, 135);
        select(160, 110);
        editor.startConnection();
        select(185, 135);
        select(130, 80);
        editor.startConnection();
        editor.removeSelectedPart();
        expect(editor.connectionSource).toBeUndefined();
        expect(editor.connections).toHaveLength(1);
        expect(editor.connections[0].first).toBe(editor.parts[0]);
        expect(editor.connections[0].second).toBe(editor.parts[1]);
    });

    it('draws labelled connections before boxes and follows moved endpoint positions', () => {
        const fixture = TestBed.createComponent(CanvasDiagramEditor);
        fixture.detectChanges();
        const editor = fixture.componentInstance;
        editor.addPart();
        editor.addPart();
        const canvas: HTMLCanvasElement = fixture.nativeElement.querySelector('canvas');
        canvas.dispatchEvent(pointer('pointerdown', 130, 80, 1));
        canvas.dispatchEvent(pointer('pointerup', 130, 80, 1));
        editor.startConnection();
        canvas.dispatchEvent(pointer('pointerdown', 160, 110, 1));
        editor.renameConnection(editor.connections[0], 'uses');
        canvas.dispatchEvent(pointer('pointerdown', 160, 110, 1));
        canvas.dispatchEvent(pointer('pointermove', 460, 110, 1));
        canvas.dispatchEvent(pointer('pointerup', 460, 110, 1));
        surface.paint();
        expect(surface.operations.slice(-3)).toEqual(['line', 'box', 'box']);
        expect(surface.paths.at(-1)).toEqual([[204, 64 + 90 * 24 / 324], [348, 88 - 90 * 24 / 324]]);
        expect(surface.draws).toContainEqual(['uses', 276, 66]);
    });

    it('renders aligned and coincident endpoint positions without non-finite coordinates', () => {
        const fixture = TestBed.createComponent(CanvasDiagramEditor);
        fixture.detectChanges();
        const editor = fixture.componentInstance;
        editor.addPart();
        editor.addPart();
        const canvas: HTMLCanvasElement = fixture.nativeElement.querySelector('canvas');
        canvas.dispatchEvent(pointer('pointerdown', 130, 80, 1));
        canvas.dispatchEvent(pointer('pointerup', 130, 80, 1));
        editor.startConnection();
        canvas.dispatchEvent(pointer('pointerdown', 160, 110, 1));
        canvas.dispatchEvent(pointer('pointerdown', 160, 110, 1));
        canvas.dispatchEvent(pointer('pointermove', 136, 310, 1));
        surface.paint();
        expect(surface.paths.at(-1)).toEqual([[114, 104], [114, 248]]);
        canvas.dispatchEvent(pointer('pointermove', 136, 86, 1));
        surface.paint();
        expect(surface.paths.at(-1)).toEqual([[114, 64], [114, 64]]);
        canvas.dispatchEvent(pointer('pointermove', 436, 86, 1));
        surface.paint();
        expect(surface.paths.at(-1)).toEqual([[204, 64], [324, 64]]);
        canvas.dispatchEvent(pointer('pointermove', 136, 86, 1));
        canvas.dispatchEvent(pointer('pointerup', 136, 86, 1));
        canvas.dispatchEvent(pointer('pointerdown', 102, 52, 1));
        expect(editor.selectedConnection).toBeUndefined();
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
        const input: HTMLInputElement = fixture.nativeElement.querySelector('.canvas-controls input');
        expect(input.disabled).toBe(false);
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
        expect(input.disabled).toBe(false);
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
        canvas.dispatchEvent(pointer('pointerdown', 102, 52, 1));
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
    Object.defineProperties(event, {
        pointerId: { value: pointerId },
        clientX: { value: clientX },
        clientY: { value: clientY },
    });
    return event;
}
