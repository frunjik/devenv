import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
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
        strokeStyle: '', fillStyle: '', save: () => {}, restore: () => {}, clip: () => {},
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
    let fixture: ComponentFixture<CanvasDiagramEditor>;
    let editor: CanvasDiagramEditor;
    let host: HTMLElement;

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

    afterEach(() => { TestBed.resetTestingModule(); });

    function createEditor(): void {
        fixture = TestBed.createComponent(CanvasDiagramEditor);
        editor = fixture.componentInstance;
        host = fixture.nativeElement;
        fixture.detectChanges();
    }

    function button(label: string): HTMLButtonElement {
        return host.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!;
    }

    function clickButton(label: string): void {
        button(label).click();
        fixture.detectChanges();
    }

    function dispatch(type: string, x: number, y: number, id = 1): void {
        host.querySelector('canvas')!.dispatchEvent(pointer(type, x + 101, y + 51, id));
        fixture.detectChanges();
    }

    function clickCanvas(x: number, y: number): void {
        dispatch('pointerdown', x, y);
        dispatch('pointerup', x, y);
    }

    function drag(fromX: number, fromY: number, toX: number, toY: number): void {
        dispatch('pointerdown', fromX, fromY);
        dispatch('pointermove', toX, toY);
        dispatch('pointerup', toX, toY);
    }

    function input(): HTMLInputElement { return host.querySelector('input.form-control')!; }

    function enterLabel(value: string): void {
        input().value = value;
        input().dispatchEvent(new Event('input'));
        fixture.detectChanges();
    }

    function addParts(count: number): void {
        for (let i = 0; i < count; i++) { editor.addPart(); }
        fixture.detectChanges();
    }

    function connect(x1: number, y1: number, x2: number, y2: number): void {
        clickCanvas(x1, y1);
        clickButton('Connect selected part');
        clickCanvas(x2, y2);
    }

    function checkLine(index: number): void {
        host.querySelectorAll<HTMLInputElement>('.connection-picker input')[index].click();
        fixture.detectChanges();
    }

    function loadOverview(): void { clickButton('Load DevEnv overview'); }

    function replaceOverview(): void {
        loadOverview();
        clickButton('Confirm replacement');
    }

    it('places connection controls before the workspace in reading and tab order', () => {
        createEditor();
        const connections = host.querySelector('.connection-controls')!;
        const workspace = host.querySelector('.canvas-viewport')!;
        expect(connections.compareDocumentPosition(workspace) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
    });

    it('loads the technical picture through a public control', () => {
        createEditor();
        expect(button('Load DevEnv technical picture')).not.toBeNull();
        clickButton('Load DevEnv technical picture');
        expect(editor.parts.map(part => part.label)).toEqual([
            'DevEnv user', 'DevEnv client', 'Angular development server', 'DevEnv API',
            'Development subprocesses', 'Workspace resources', 'Ticket store',
            'Test-run cache', 'Export destination',
        ]);
        expect(editor.connections).toHaveLength(9);
        expect(host.textContent).toContain('Current-architecture draft');
    });

    describe('technical picture', () => {
        beforeEach(() => { createEditor(); clickButton('Load DevEnv technical picture'); });

        it('loads directed relationships with the architecture endpoint identities', () => {
            expect(editor.connections.map(connection => [
                connection.first.label, connection.second.label, connection.label, connection.directed,
            ])).toEqual([
                ['DevEnv user', 'DevEnv client', 'Works through the browser UI', true],
                ['DevEnv client', 'Angular development server', 'Loads client assets', true],
                ['DevEnv client', 'DevEnv API', 'Requests data and actions', true],
                ['DevEnv API', 'Workspace resources', 'Reads resources and edits files', true],
                ['DevEnv API', 'Ticket store', 'Loads and persists tickets and history', true],
                ['DevEnv API', 'Test-run cache', 'Stores and retrieves test results', true],
                ['DevEnv API', 'Development subprocesses', 'Starts Git and test commands', true],
                ['Development subprocesses', 'Workspace resources', 'Operates on repository and source', true],
                ['DevEnv API', 'Export destination', 'Stages and installs a curated clone', true],
            ]);
        });

        it('draws the two boundaries behind nine parts and labels technologies', () => {
            surface.paint();
            expect(surface.boxes.slice(0, 2)).toEqual([[312, 32, 236, 156], [732, 32, 636, 796]]);
            expect(surface.boxes).toHaveLength(11);
            expect(surface.draws.map(draw => draw[0])).toContain('Browser execution environment');
            expect(surface.draws.map(draw => draw[0])).toContain('Development host');
            expect(surface.draws.map(draw => draw[0])).toContain('Angular / TypeScript');
            expect(surface.draws.map(draw => draw[0])).toContain('Node.js / Express');
        });

        it('draws a target arrowhead on each relationship', () => {
            surface.paint();
            expect(surface.paths).toHaveLength(18);
            expect(surface.paths[0]).toEqual([[220, 120], [340, 120]]);
            expect(surface.paths[1]).toEqual([[330, 115], [340, 120], [330, 125]]);
        });

        it('keeps the boundary attached to a member dragged outside its original extent', () => {
            drag(350, 90, 150, 290);
            surface.paint();
            expect(surface.boxes[0]).toEqual([112, 232, 236, 156]);
            expect(editor.parts[1].position).toEqual({ x: 140, y: 280 });
        });

        it('allows a reverse directed link but still rejects the same direction twice', () => {
            connect(350, 90, 50, 90);
            expect(editor.connections).toHaveLength(10);
            expect(editor.connections[9].directed).toBe(true);
            connect(350, 90, 50, 90);
            expect(editor.connections).toHaveLength(10);
            expect(editor.connectionMessage).toContain('already connected');
        });

        it('draws an added directed link without imported label offsets or technology', () => {
            connect(350, 90, 50, 90);
            clickCanvas(280, 120);
            enterLabel('Response');
            surface.paint();
            expect(editor.selectedConnection?.label).toBe('Response');
            expect(surface.draws).toContainEqual(['Response', 280, 80]);
            expect(surface.paths.at(-1)).toEqual([[230, 125], [220, 120], [230, 115]]);
        });

        it('uses arrow direction and technology in the HTML connection picker', () => {
            const labels = [...host.querySelectorAll('.connection-option span')].map(span => span.textContent);
            expect(labels).toContain('DevEnv client -> DevEnv API: Requests data and actions (HTTP / JSON; test responses stream NDJSON)');
            expect(host.textContent).toContain('compile-time library');
        });

        it('removes an empty boundary when its last member is deleted', () => {
            clickCanvas(350, 90);
            clickButton('Remove selected part');
            expect(editor.boundaries.map(boundary => boundary.label)).toEqual(['Development host']);
            expect(editor.connections.some(connection => connection.first.label === 'DevEnv client'
                || connection.second.label === 'DevEnv client')).toBe(false);
        });

        it('cancels switching views without losing directed links, checked lines or selection', () => {
            clickCanvas(350, 90);
            checkLine(0);
            loadOverview();
            clickButton('Cancel replacement');
            expect(editor.technicalLoaded).toBe(true);
            expect(editor.selectedPart?.label).toBe('DevEnv client');
            expect(editor.checkedConnections.size).toBe(1);
        });

        it('clears technical metadata and restores undirected behavior on overview replacement', () => {
            checkLine(0);
            loadOverview();
            clickButton('Confirm replacement');
            expect(editor.technicalLoaded).toBe(false);
            expect(editor.overviewLoaded).toBe(true);
            expect(editor.boundaries).toEqual([]);
            expect(editor.technicalNotes).toBe('');
            expect(editor.checkedConnections.size).toBe(0);
            expect(editor.connections.every(connection => !connection.directed && !connection.technology)).toBe(true);
            expect(editor.parts.every(part => !part.technology && !part.description)).toBe(true);
        });

        it('reloads the source rather than retaining edits or identities', () => {
            clickCanvas(50, 90);
            enterLabel('Edited user');
            const oldParts = editor.parts;
            clickButton('Load DevEnv technical picture');
            clickButton('Confirm replacement');
            expect(editor.parts[0].label).toBe('DevEnv user');
            expect(editor.parts.every(part => part.id > oldParts[8].id)).toBe(true);
            expect(editor.selectedPart).toBeUndefined();
        });

        it('keeps coincident directed links finite without drawing an undefined arrowhead', () => {
            drag(350, 90, 50, 90);
            surface.paint();
            expect(surface.paths[0]).toEqual([[130, 120], [130, 120]]);
            expect(surface.paths.flat(2).every(Number.isFinite)).toBe(true);
            expect(surface.paths).toHaveLength(17);
        });
    });

    it('confirms loading the technical view over a custom sketch and ends its old drag', () => {
        createEditor();
        addParts(1);
        dispatch('pointerdown', 29, 29);
        const original = editor.parts[0];
        clickButton('Load DevEnv technical picture');
        expect(editor.parts).toEqual([original]);
        clickButton('Confirm replacement');
        dispatch('pointermove', 400, 400);
        expect(original.position).toEqual({ x: 24, y: 24 });
        expect(editor.technicalLoaded).toBe(true);
        expect(editor.selectedPart).toBeUndefined();
    });

    describe('DevEnv overview', () => {
        beforeEach(() => { createEditor(); loadOverview(); });

        it('loads the six explanatory labels with unique identities', () => {
            expect(editor.parts.map(part => part.label)).toEqual([
                'People / product team', 'Goals & intended outcomes', 'Problems & inquiry',
                'Knowledge & decisions', 'Work & changes', 'Evidence & learning',
            ]);
            expect(new Set(editor.parts.map(part => part.id)).size).toBe(6);
        });

        it('loads the labelled loop with the correct endpoint references', () => {
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
        });

        it('marks the scrollable workspace as explanatory', () => {
            expect(host.textContent).toContain('Explanatory sketch');
            expect(host.querySelector('.canvas-viewport')!.classList.contains('overview-workspace')).toBe(true);
        });

        it('draws the six boxes with bounded labels', () => {
            surface.paint();
            expect(surface.boxes.slice(-6)).toEqual([
                [40, 40, 180, 80], [340, 40, 180, 80], [640, 40, 180, 80],
                [640, 320, 180, 80], [340, 320, 180, 80], [40, 320, 180, 80],
            ]);
            expect(surface.textWidths.filter(width => width !== undefined).slice(-6)).toEqual([164, 164, 164, 164, 164, 164]);
        });

        it('allocates fresh part and connection identities on reload', () => {
            const parts = editor.parts;
            const connections = editor.connections;
            replaceOverview();
            expect(editor.parts.every(part => part.id > parts[5].id)).toBe(true);
            expect(editor.connections.every(connection => connection.id > connections[5].id
                && editor.parts.includes(connection.first) && editor.parts.includes(connection.second))).toBe(true);
        });

        it('edits a selected link and restores its source label on replacement', () => {
            clickCanvas(289, 80);
            expect(editor.selectedConnection).toBe(editor.connections[0]);
            enterLabel('Edited overview link');
            expect(editor.connections[0].label).toBe('Edited overview link');
            replaceOverview();
            expect(editor.selectedConnection).toBeUndefined();
            expect(editor.connections[0].label).toBe('defines');
        });

        describe('while choosing a destination', () => {
            beforeEach(() => { clickCanvas(59, 59); editor.startConnection(); loadOverview(); });

            it('preserves connection mode on cancellation', () => {
                clickButton('Cancel replacement');
                expect(editor.connectionSource).toBe(editor.parts[0]);
            });

            it('clears connection mode and its message on replacement', () => {
                clickButton('Confirm replacement');
                expect(editor.connectionSource).toBeUndefined();
                expect(editor.connectionMessage).toBe('');
            });
        });
    });

    describe('replacement of a custom sketch', () => {
        beforeEach(() => {
            createEditor();
            enterLabel('My preserved draft');
            addParts(1);
            dispatch('pointerdown', 29, 29);
            loadOverview();
        });

        it('requests confirmation without changing the sketch or selection', () => {
            expect(editor.parts).toHaveLength(1);
            expect(editor.parts[0].label).toBe('My preserved draft');
            expect(editor.selectedPart).toBe(editor.parts[0]);
            expect(host.textContent).toContain('Replace the current sketch?');
        });

        it('cancels without changing content or selection', () => {
            const original = editor.parts[0];
            clickButton('Cancel replacement');
            expect(editor.parts).toEqual([original]);
            expect(editor.selectedPart).toBe(original);
            expect(host.querySelector('[aria-label="Confirm replacement"]')).toBeNull();
        });

        it('clears selection but preserves the draft on replacement', () => {
            clickButton('Confirm replacement');
            expect(editor.selectedPart).toBeUndefined();
            expect(editor.selectedConnection).toBeUndefined();
            expect(editor.labelValue).toBe('My preserved draft');
        });

        it('preserves the draft through subsequent overview replacements', () => {
            clickButton('Confirm replacement');
            clickCanvas(289, 80);
            enterLabel('Edited overview link');
            replaceOverview();
            expect(editor.labelValue).toBe('My preserved draft');
        });

        it('ends the old drag and never reuses its identity', () => {
            const original = editor.parts[0];
            clickButton('Confirm replacement');
            dispatch('pointermove', 699, 349);
            expect(original.position).toEqual({ x: 24, y: 24 });
            expect(editor.parts.every(part => part.id > original.id)).toBe(true);
        });
    });

    describe('connection picker', () => {
        beforeEach(() => { createEditor(); loadOverview(); });

        it('starts collapsed with six unchecked lines and one disabled delete button', () => {
            expect(host.querySelector<HTMLDetailsElement>('.connection-picker')!.open).toBe(false);
            expect(host.querySelectorAll('.connection-picker input')).toHaveLength(6);
            expect(host.querySelectorAll('.connection-controls button')).toHaveLength(1);
            expect(button('Delete selected connections').disabled).toBe(true);
        });

        it('unchecks without deleting the connection', () => {
            checkLine(0);
            checkLine(0);
            expect(editor.checkedConnections.size).toBe(0);
            expect(editor.connections).toHaveLength(6);
        });

        it('cleans checked membership on individual removal', () => {
            checkLine(0);
            editor.removeConnection(editor.connections[0]);
            expect(editor.checkedConnections.size).toBe(0);
        });

        it('cleans only incident checked connections on part removal', () => {
            checkLine(1);
            checkLine(2);
            const retained = editor.connections[2];
            clickCanvas(359, 59);
            editor.removeSelectedPart();
            expect([...editor.checkedConnections]).toEqual([retained]);
        });

        describe('with a canvas-selected line and two checked lines', () => {
            beforeEach(() => { clickCanvas(289, 80); checkLine(0); checkLine(1); });

            it('does not change label-edit selection and enables deletion', () => {
                expect(editor.selectedConnection).toBe(editor.connections[0]);
                expect(editor.labelPurpose).toBe('Connection label');
                expect(button('Delete selected connections').disabled).toBe(false);
            });

            it('deletes only the checked lines and clears removed canvas selection', () => {
                const retained = editor.connections.slice(2);
                clickButton('Delete selected connections');
                expect(editor.connections).toEqual(retained);
                expect(editor.selectedConnection).toBeUndefined();
            });

            it('resets checkbox controls after deletion', () => {
                clickButton('Delete selected connections');
                expect(button('Delete selected connections').disabled).toBe(true);
                expect(host.querySelectorAll('.connection-picker input:checked')).toHaveLength(0);
            });

            it('preserves checked references on cancelled replacement', () => {
                const checked = [...editor.checkedConnections];
                loadOverview();
                clickButton('Cancel replacement');
                expect([...editor.checkedConnections]).toEqual(checked);
            });

            it('clears checked references and controls on replacement', () => {
                replaceOverview();
                expect(editor.checkedConnections.size).toBe(0);
                expect(host.querySelectorAll('.connection-picker input:checked')).toHaveLength(0);
                expect(button('Delete selected connections').disabled).toBe(true);
            });
        });
    });

    describe('draft labels', () => {
        beforeEach(createEditor);

        it('starts with an enabled default draft', () => {
            expect(input().disabled).toBe(false);
            expect(input().value).toBe('Part 1');
        });

        it('preserves a custom draft through repeated additions', () => {
            enterLabel('DevEnv client');
            clickButton('Add part');
            clickButton('Add part');
            expect(editor.parts.map(part => part.label)).toEqual(['DevEnv client', 'DevEnv client']);
            expect(input().value).toBe('DevEnv client');
        });

        it('preserves an empty custom draft through selection and removal', () => {
            enterLabel('');
            addParts(1);
            expect(editor.parts[0].label).toBe('');
            clickCanvas(29, 29);
            enterLabel('Temporary');
            editor.removeSelectedPart();
            expect(editor.labelValue).toBe('');
            addParts(1);
            expect(editor.parts[0].label).toBe('');
        });
    });

    describe('contextual input for connected parts', () => {
        beforeEach(() => {
            createEditor();
            addParts(2);
            enterLabel('Next component');
            connect(29, 29, 59, 59);
            drag(59, 59, 359, 35);
        });

        it('edits the selected part and disables Add', () => {
            clickCanvas(29, 29);
            expect(input().getAttribute('aria-label')).toBe('Part label');
            expect(button('Add part').disabled).toBe(true);
            enterLabel('Client');
            expect(editor.parts[0].label).toBe('Client');
        });

        it('blocks label editing and addition while choosing a destination', () => {
            clickCanvas(29, 29);
            enterLabel('Client');
            editor.startConnection();
            fixture.detectChanges();
            expect(input().disabled).toBe(true);
            editor.editLabel('Blocked');
            editor.addPart();
            expect(editor.parts[0].label).toBe('Client');
            expect(editor.parts).toHaveLength(2);
        });

        it('reenables the input after cancelling connection mode', () => {
            clickCanvas(29, 29);
            clickButton('Connect selected part');
            expect(input().disabled).toBe(true);
            clickButton('Cancel connection');
            expect(input().disabled).toBe(false);
        });

        describe('with a selected line', () => {
            beforeEach(() => { clickCanvas(276, 64); });

            it('selects the line exclusively rather than either part', () => {
                expect(editor.selectedConnection).toBe(editor.connections[0]);
                expect(editor.selectedPart).toBeUndefined();
            });

            it('uses the enabled input for the empty connection label', () => {
                expect(input().getAttribute('aria-label')).toBe('Connection label');
                expect(input().value).toBe('');
                expect(input().disabled).toBe(false);
            });

            it('edits the line and emphasizes it rather than either box', () => {
                enterLabel('uses');
                surface.paint();
                expect(editor.connections[0].label).toBe('uses');
                expect(surface.lineWidths.at(-1)).toBe(3);
                expect(surface.borders.slice(-2)).toEqual([1, 1]);
            });

            it('keeps one text control and disallows adding or connecting', () => {
                expect(host.querySelectorAll('input.form-control')).toHaveLength(1);
                expect(button('Connect selected part').disabled).toBe(true);
                editor.addPart();
                expect(editor.parts).toHaveLength(2);
            });

            it('restores the draft and Add action on empty click', () => {
                clickCanvas(10, 10);
                expect(input().getAttribute('aria-label')).toBe('Label for next part');
                expect(input().value).toBe('Next component');
                expect(button('Add part').disabled).toBe(false);
                clickButton('Add part');
                expect(editor.parts[2].label).toBe('Next component');
            });

            it('restores the draft when the selected line is removed', () => {
                editor.removeConnection(editor.connections[0]);
                fixture.detectChanges();
                expect(editor.selectedConnection).toBeUndefined();
                expect(input().value).toBe('Next component');
            });
        });
    });

    describe('line hit testing', () => {
        beforeEach(() => { createEditor(); addParts(2); connect(29, 29, 59, 59); drag(59, 59, 359, 35); });

        it.each([58, 70])('selects within the six-pixel tolerance at y=%s', y => {
            clickCanvas(276, y);
            expect(editor.selectedConnection).toBe(editor.connections[0]);
        });

        it.each([[276, 70.01], [600, 64], [-20, 64]])('rejects outside the drawn segment at (%s, %s)', (x, y) => {
            clickCanvas(x, y);
            expect(editor.selectedConnection).toBeUndefined();
        });

        it('prioritizes a box over its connection', () => {
            clickCanvas(114, 64);
            expect(editor.selectedPart).toBe(editor.parts[0]);
            expect(editor.selectedConnection).toBeUndefined();
        });

        it('does not drag a selected line', () => {
            clickCanvas(276, 70);
            dispatch('pointermove', 399, 109);
            expect(editor.parts[1].position).toEqual({ x: 348, y: 24 });
        });

        describe('with overlapping lines', () => {
            beforeEach(() => {
                clickCanvas(10, 10);
                addParts(1);
                drag(83, 83, 359, 35);
                connect(29, 29, 359, 35);
                clickCanvas(276, 64);
            });

            it('selects the newest line and retains it when another is removed', () => {
                expect(editor.selectedConnection).toBe(editor.connections[1]);
                editor.removeConnection(editor.connections[0]);
                expect(editor.selectedConnection).toBe(editor.connections[0]);
            });

            it('follows changed diagonal geometry rather than the previous segment', () => {
                editor.removeConnection(editor.connections[0]);
                drag(359, 35, 359, 235);
                clickCanvas(276, 164);
                expect(editor.selectedConnection).toBe(editor.connections[0]);
                clickCanvas(276, 64);
                expect(editor.selectedConnection).toBeUndefined();
            });
        });
    });

    describe('connection creation', () => {
        beforeEach(() => { createEditor(); addParts(2); });

        it('requires a selected source', () => {
            editor.startConnection();
            fixture.detectChanges();
            expect(host.querySelector('[role="status"]')!.textContent).toContain('Select a part');
        });

        describe('with a selected source', () => {
            beforeEach(() => { clickCanvas(29, 29); clickButton('Connect selected part'); });

            it('connects the two endpoint references', () => {
                dispatch('pointerdown', 59, 59);
                expect(editor.connections).toHaveLength(1);
                expect(editor.connections[0].first).toBe(editor.parts[0]);
                expect(editor.connections[0].second).toBe(editor.parts[1]);
            });

            it('does not start a destination drag', () => {
                dispatch('pointerdown', 59, 59);
                dispatch('pointermove', 99, 99);
                expect(editor.parts[1].position).toEqual({ x: 48, y: 48 });
            });

            it('retains connection mode on empty click', () => {
                dispatch('pointerdown', 1, 1);
                expect(editor.connectionSource).toBe(editor.parts[0]);
            });

            it('rejects a self-connection explicitly', () => {
                dispatch('pointerdown', 29, 29);
                expect(host.querySelector('[role="status"]')!.textContent).toContain('different part');
                expect(editor.connections).toHaveLength(0);
            });

            it('cancels explicitly', () => {
                clickButton('Cancel connection');
                expect(editor.connectionSource).toBeUndefined();
            });
        });

        describe('with an existing undirected connection', () => {
            beforeEach(() => { connect(29, 29, 59, 59); clickCanvas(59, 59); clickButton('Connect selected part'); });

            it('rejects the reversed duplicate pair', () => {
                dispatch('pointerdown', 29, 29);
                expect(host.querySelector('[role="status"]')!.textContent).toContain('already connected');
                expect(editor.connections).toHaveLength(1);
            });

            it('still rejects self-connection', () => {
                dispatch('pointerdown', 59, 59);
                expect(host.querySelector('[role="status"]')!.textContent).toContain('different part');
            });

            it('still detects duplicates after cancellation and restart', () => {
                clickButton('Cancel connection');
                clickButton('Connect selected part');
                dispatch('pointerdown', 29, 29);
                expect(host.querySelector('[role="status"]')!.textContent).toContain('already connected');
            });
        });
    });

    describe('connection editing and removal', () => {
        beforeEach(() => { createEditor(); addParts(3); connect(29, 29, 59, 59); });

        it('renames a connection without losing it when a part is renamed', () => {
            editor.renameConnection(editor.connections[0], 'uses');
            expect(editor.connections[0].label).toBe('uses');
            editor.renamePart('Client sketch');
            expect(editor.connections).toHaveLength(1);
        });

        it('deletes through the HTML picker and never reuses the connection identity', () => {
            const firstId = editor.connections[0].id;
            checkLine(0);
            clickButton('Delete selected connections');
            expect(editor.connections).toHaveLength(0);
            connect(29, 29, 59, 59);
            expect(editor.connections[0].id).toBeGreaterThan(firstId);
        });

        it('removes only the requested connection', () => {
            connect(29, 29, 84, 84);
            editor.removeConnection(editor.connections[1]);
            expect(editor.connections).toHaveLength(1);
        });

        it('removes incident connections and cancels mode when their part is removed', () => {
            connect(29, 29, 84, 84);
            connect(59, 59, 84, 84);
            clickCanvas(29, 29);
            editor.startConnection();
            editor.removeSelectedPart();
            expect(editor.connectionSource).toBeUndefined();
            expect(editor.connections).toHaveLength(1);
            expect(editor.connections[0].first).toBe(editor.parts[0]);
            expect(editor.connections[0].second).toBe(editor.parts[1]);
        });
    });

    describe('connection rendering', () => {
        beforeEach(() => { createEditor(); addParts(2); connect(29, 29, 59, 59); });

        describe('with a labelled diagonal connection', () => {
            beforeEach(() => { editor.renameConnection(editor.connections[0], 'uses'); drag(59, 59, 359, 59); surface.paint(); });

            it('draws boxes before connection lines', () => {
                expect(surface.operations.slice(-3)).toEqual(['box', 'box', 'line']);
            });

            it('clips the line to the moved endpoints and centers its label', () => {
                expect(surface.paths.at(-1)).toEqual([[204, 64 + 90 * 24 / 324], [348, 88 - 90 * 24 / 324]]);
                expect(surface.draws).toContainEqual(['uses', 276, 66]);
            });
        });

        it.each([
            [35, 259, [[114, 104], [114, 248]]],
            [35, 35, [[114, 64], [114, 64]]],
            [335, 35, [[204, 64], [324, 64]]],
        ])('renders finite clipped geometry when the grabbed point moves to (%s, %s)', (x, y, expected) => {
            drag(59, 59, x, y);
            surface.paint();
            expect(surface.paths.at(-1)).toEqual(expected);
        });

        it('does not select a coincident connection from empty space', () => {
            drag(59, 59, 35, 35);
            clickCanvas(1, 1);
            expect(editor.selectedConnection).toBeUndefined();
        });
    });

    describe('parts', () => {
        beforeEach(createEditor);

        it('draws a new labelled box and leaves Add enabled', () => {
            clickButton('Add part');
            surface.paint();
            expect(surface.boxes.at(-1)).toEqual([24, 24, 180, 80]);
            expect(surface.draws).toContainEqual(['Part 1', 114, 64]);
            expect(button('Add part').disabled).toBe(false);
        });

        it('adds independently labelled boxes', () => {
            clickButton('Add part');
            clickButton('Add part');
            surface.paint();
            expect(surface.boxes.slice(-2)).toEqual([[24, 24, 180, 80], [48, 48, 180, 80]]);
            expect(surface.draws).toContainEqual(['Part 2', 138, 88]);
        });

        describe('with five parts', () => {
            beforeEach(() => { addParts(5); });

            it('repeats placement without repeating identities', () => {
                expect(editor.parts.map(part => part.id)).toEqual([1, 2, 3, 4, 5]);
                expect(editor.parts.map(part => part.position)).toEqual([
                    { x: 24, y: 24 }, { x: 48, y: 48 }, { x: 72, y: 72 }, { x: 96, y: 96 }, { x: 24, y: 24 },
                ]);
            });

            it('selects the topmost repeat', () => {
                clickCanvas(29, 29);
                expect(editor.selectedPart).toBe(editor.parts[4]);
            });

            it('keeps drawing order when the older part becomes selectable', () => {
                clickCanvas(29, 29);
                editor.removeSelectedPart();
                clickCanvas(29, 29);
                surface.paint();
                expect(editor.selectedPart).toBe(editor.parts[0]);
                expect(surface.draws.slice(-4).map(draw => draw[0])).toEqual(['Part 1', 'Part 2', 'Part 3', 'Part 4']);
                expect(surface.borders.slice(-4)).toEqual([3, 1, 1, 1]);
                expect(editor.parts.map(part => part.id)).toEqual([1, 2, 3, 4]);
            });
        });

        describe('with overlapping parts', () => {
            beforeEach(() => { addParts(2); dispatch('pointerdown', 59, 59); });

            it('selects the newest part with a distinct identity', () => {
                expect(editor.parts[0].id).not.toBe(editor.parts[1].id);
                expect(editor.selectedPart).toBe(editor.parts[1]);
            });

            it('renames and moves only the selected part', () => {
                editor.renamePart('Same label');
                dispatch('pointermove', 79, 79);
                expect(editor.parts[0].label).toBe('Part 1');
                expect(editor.parts[0].position).toEqual({ x: 24, y: 24 });
                expect(editor.parts[1].position).toEqual({ x: 68, y: 68 });
            });

            it('enables removal and clears selection after removal', () => {
                const first = editor.parts[0];
                expect(button('Remove selected part').disabled).toBe(false);
                clickButton('Remove selected part');
                expect(editor.parts).toEqual([first]);
                expect(editor.selectedPart).toBeUndefined();
                expect(button('Remove selected part').disabled).toBe(true);
            });

            it('ends a removed part drag', () => {
                const second = editor.parts[1];
                dispatch('pointermove', 79, 79);
                clickButton('Remove selected part');
                dispatch('pointermove', 99, 99);
                expect(second.position).toEqual({ x: 68, y: 68 });
            });

            it('can select the underlying part and never reuses a removed identity', () => {
                const second = editor.parts[1];
                clickButton('Remove selected part');
                clickCanvas(59, 59);
                expect(editor.selectedPart).toBe(editor.parts[0]);
                editor.renamePart('Same label');
                clickCanvas(1, 1);
                addParts(1);
                expect(editor.parts[1].id).toBeGreaterThan(second.id);
                expect(editor.parts[1].label).toBe('Part 3');
            });
        });

        it('does not rename or remove without a selection', () => {
            addParts(2);
            const first = editor.parts[0];
            clickCanvas(29, 29);
            editor.renamePart('Same label');
            const requests = surface.requests;
            clickCanvas(1, 1);
            editor.renamePart('Must not rename');
            editor.removeSelectedPart();
            expect(first.label).toBe('Same label');
            expect(editor.parts).toHaveLength(2);
            expect(surface.requests).toBe(requests + 1);
        });

        it('starts with disabled removal and safely ignores removal without parts', () => {
            expect(button('Remove selected part').disabled).toBe(true);
            editor.removeSelectedPart();
            expect(editor.parts).toHaveLength(0);
        });
    });

    describe('part dragging', () => {
        beforeEach(() => { createEditor(); addParts(1); dispatch('pointerdown', 34, 34); });

        it('keeps the label input enabled and captures the pointer', () => {
            expect(input().disabled).toBe(false);
            expect(surface.captured).toEqual([1]);
        });

        it('ignores movement from another pointer', () => {
            dispatch('pointermove', 54, 64, 2);
            expect(editor.parts[0].position).toEqual({ x: 24, y: 24 });
        });

        it('moves without a jump and renders the edited label', () => {
            enterLabel('Client sketch');
            dispatch('pointermove', 54, 64);
            surface.paint();
            expect(surface.boxes.at(-1)).toEqual([44, 54, 180, 80]);
            expect(surface.draws).toContainEqual(['Client sketch', 134, 94]);
        });

        it('ignores another pointer release, then stops on the matching release', () => {
            dispatch('pointerup', 54, 64, 2);
            dispatch('pointermove', 54, 64);
            dispatch('pointerup', 54, 64);
            dispatch('pointermove', 74, 84);
            expect(editor.parts[0].position).toEqual({ x: 44, y: 54 });
        });

        it.each(['pointercancel', 'lostpointercapture'])('stops on %s', end => {
            dispatch(end, 34, 34);
            dispatch('pointermove', 54, 64);
            expect(editor.parts[0].position).toEqual({ x: 24, y: 24 });
        });

        it('ignores a second drag start', () => {
            dispatch('pointerdown', 49, 49, 2);
            expect(surface.captured).toEqual([1]);
        });

        it('deselects on empty click after release without disabling the input', () => {
            dispatch('pointerup', 34, 34);
            clickCanvas(1, 1);
            expect(input().disabled).toBe(false);
        });
    });

    describe('part hit testing', () => {
        beforeEach(() => { createEditor(); addParts(1); });

        it.each([[24, 24], [204, 104]])('includes the box edge at (%s, %s)', (x, y) => {
            clickCanvas(x, y);
            expect(editor.selectedPart).toBe(editor.parts[0]);
        });

        it.each([[205, 104], [24, 105], [23, 24], [24, 23]])('excludes points outside the box at (%s, %s)', (x, y) => {
            clickCanvas(x, y);
            expect(editor.selectedPart).toBeUndefined();
        });

        it('allows an empty selected label', () => {
            clickCanvas(34, 34);
            editor.renamePart('');
            expect(editor.parts[0].label).toBe('');
        });

        it('ignores non-primary starts', () => {
            host.querySelector('canvas')!.dispatchEvent(new MouseEvent('pointerdown', { button: 2 }));
            expect(surface.captured).toEqual([]);
        });
    });

    describe('clock and surface lifecycle', () => {
        beforeEach(createEditor);

        it('initializes the actual canvas and draws centered current time', () => {
            const time = currentTime();
            surface.paint();
            expect(surface.element).toBe(host.querySelector('canvas'));
            expect([time, currentTime()]).toContain(surface.draws.at(-1)?.[0]);
            expect(surface.draws.at(-1)?.slice(1)).toEqual([160, 90]);
        });

        it('invalidates and repaints once per scheduler tick', () => {
            surface.paint();
            const requests = surface.requests;
            const draws = surface.draws.length;
            scheduler.tick();
            expect(scheduler.interval).toBe(1000);
            expect(surface.requests).toBe(requests + 1);
            surface.paint();
            expect(surface.draws).toHaveLength(draws + 1);
        });

        it('recenters current time for new surface dimensions', () => {
            surface.width = 240;
            surface.height = 135;
            surface.requestDraw();
            const time = currentTime();
            surface.paint();
            expect([time, currentTime()]).toContain(surface.draws.at(-1)?.[0]);
            expect(surface.draws.at(-1)?.slice(1)).toEqual([120, 67.5]);
        });

        it('stops clock invalidation and destroys the surface', () => {
            fixture.destroy();
            const requests = surface.requests;
            scheduler.tick();
            scheduler.tick();
            expect(surface.requests).toBe(requests);
            expect(surface.destroyed).toBe(true);
        });

        it('emits logical pointer coordinates', () => {
            const points: { x: number; y: number }[] = [];
            editor.pointerMoved.subscribe(point => points.push(point));
            dispatch('pointermove', 160, 90);
            expect(points).toEqual([{ x: 160, y: 90 }]);
        });
    });

    it('propagates initialization errors without scheduling and cleans up the failed view', () => {
        surface.error = 'Canvas unavailable';
        fixture = TestBed.createComponent(CanvasDiagramEditor);
        expect(() => fixture.detectChanges()).toThrow('Canvas unavailable');
        expect(scheduler.interval).toBeUndefined();
        fixture.destroy();
        expect(surface.destroyed).toBe(true);
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
