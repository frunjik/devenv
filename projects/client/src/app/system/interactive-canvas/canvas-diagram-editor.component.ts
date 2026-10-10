import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild, inject } from '@angular/core';
import { CANVAS } from './canvas';
import type { ICanvas } from './canvas';
import { InteractiveCanvas } from './interactive-canvas';
import { validateDiagramDocument } from '@shared';
import overview from './devenv-overview.json';
import { createTechnicalPicture } from './technical-picture';
import { createDefaultTemplate } from './default-template';
import type { PartShape, SketchPart, SketchConnection, SketchBoundary } from './sketch.types';
import { SketchSelection } from './sketch-selection';
import { findPartAt, findConnectionAt } from './sketch-geometry';
import { renderSketch } from './sketch-renderer';
import { SketchMarquee } from './sketch-marquee';
import { shapeLabels, shapeOptions } from './sketch-shapes';

type PictureKind = 'overview' | 'technical' | 'template';

interface CanvasDrag {
    part: SketchPart;
    pointerId: number;
    start: { x: number; y: number };
    parts: { part: SketchPart; position: { x: number; y: number } }[];
    deselectOnClick: boolean;
    moved: boolean;
}

@Component({
    selector: 'app-canvas-diagram-editor',
    standalone: true,
    templateUrl: './canvas-diagram-editor.component.html',
    styleUrl: './canvas-diagram-editor.component.scss',
    providers: [{ provide: CANVAS, useClass: InteractiveCanvas }],
})
export class CanvasDiagramEditor implements AfterViewInit, OnDestroy {
    @Output() readonly pointerMoved = new EventEmitter<ReturnType<ICanvas['point']>>();
    @ViewChild('canvas', { static: true }) private canvas!: ElementRef<HTMLCanvasElement>;
    private readonly surface = inject(CANVAS);
    parts: SketchPart[] = [];
    private readonly selection = new SketchSelection();
    private readonly marquee = new SketchMarquee();
    private get selectedItem(): SketchPart | SketchConnection | undefined {
        return this.selection.active;
    }
    connections: SketchConnection[] = [];
    connectionSource: SketchPart | undefined;
    connectionMessage = '';
    private nextConnectionId = 1;
    private nextPartId = 1;
    private draftLabel = 'Part 1';
    private customDraft = false;
    private draftShape: PartShape = 'rectangle';
    readonly shapeOptions = shapeOptions;
    private drag: CanvasDrag | undefined;
    private loadedPicture: PictureKind | undefined;
    private pendingPicture: PictureKind | undefined;
    boundaries: SketchBoundary[] = [];
    technicalNotes = '';
    get overviewLoaded(): boolean { return this.loadedPicture === 'overview'; }
    get technicalLoaded(): boolean { return this.loadedPicture === 'technical'; }
    get templateLoaded(): boolean { return this.loadedPicture === 'template'; }
    get replacementPending(): boolean { return this.pendingPicture !== undefined; }
    get checkedParts(): ReadonlySet<SketchPart> {
        return this.selection.parts;
    }
    get checkedConnections(): ReadonlySet<SketchConnection> {
        return this.selection.connections;
    }

    checkPart(part: SketchPart, checked: boolean): void {
        this.checkItem(part, checked);
    }

    checkConnection(connection: SketchConnection, checked: boolean): void {
        this.checkItem(connection, checked);
    }

    private checkItem(item: SketchPart | SketchConnection, checked: boolean): void {
        this.selection.check(item, checked);
        this.surface.requestDraw();
    }

    removeSelected(): void {
        const parts = [...this.checkedParts];
        const connections = [...this.checkedConnections];
        for (const part of parts) {
            this.removePart(part);
        }
        for (const connection of connections) {
            this.removeConnection(connection);
        }
    }

    loadOverview(): void {
        this.loadPicture('overview');
    }

    loadTechnicalPicture(): void {
        this.loadPicture('technical');
    }

    loadDefaultTemplate(): void {
        this.loadPicture('template');
    }

    private loadPicture(kind: PictureKind): void {
        if (this.parts.length) {
            this.pendingPicture = kind;
            return;
        }
        this.replacePicture(kind);
    }

    cancelReplacement(): void {
        this.pendingPicture = undefined;
    }

    confirmReplacement(): void {
        if (this.pendingPicture) {
            this.replacePicture(this.pendingPicture);
        }
    }

    private replacePicture(kind: PictureKind): void {
        const technical = kind === 'technical' ? createTechnicalPicture() : undefined;
        const template = kind === 'template' ? createDefaultTemplate() : undefined;
        const document = technical ? technical.geometry : template ? template.geometry : validateDiagramDocument(overview);
        this.selection.clear();
        this.marquee.cancel();
        this.parts = document.elements.map(element => ({
            id: this.nextPartId++,
            label: element.label,
            position: { ...element.position },
            technology: technical?.elements[element.id].technology,
            description: technical?.elements[element.id].description,
            shape: template?.shapes[element.id],
        }));
        this.connections = document.connections.map(connection => ({
            id: this.nextConnectionId++,
            first: this.parts[document.elements.findIndex(element => element.id === connection.sourceElementId)],
            second: this.parts[document.elements.findIndex(element => element.id === connection.targetElementId)],
            label: connection.label,
            directed: kind === 'technical',
            technology: technical?.relationships[connection.id].technology,
            labelOffset: technical?.labelOffsets[connection.id],
        }));
        this.boundaries = technical ? technical.groups.map(group => ({
            label: group.title,
            parts: group.elements.map(id => this.parts[document.elements.findIndex(element => element.id === id)]),
        })) : [];
        this.technicalNotes = technical?.notes ?? '';
        this.surface.resetView();
        this.drag = undefined;
        this.cancelConnection();
        this.loadedPicture = kind;
        this.pendingPicture = undefined;
        this.surface.requestDraw();
    }

    get selectedPart(): SketchPart | undefined {
        return this.selectedItem && 'position' in this.selectedItem ? this.selectedItem : undefined;
    }

    get selectedConnection(): SketchConnection | undefined {
        return this.selectedItem && 'first' in this.selectedItem ? this.selectedItem : undefined;
    }

    get shapeValue(): PartShape {
        return this.selectedPart ? this.selectedPart.shape ?? 'rectangle' : this.draftShape;
    }

    partTypeLabel(part: SketchPart): string {
        return shapeLabels[part.shape ?? 'rectangle'];
    }

    editShape(value: string): void {
        if (this.connectionSource || this.selectedConnection) {
            this.connectionMessage = 'Finish or cancel the connection, or select a part before changing its shape.';
            return;
        }
        const option = this.shapeOptions.find(candidate => candidate.value === value);
        if (!option) {
            this.connectionMessage = 'Choose a supported part shape.';
            return;
        }
        if (this.selectedPart) {
            this.selectedPart.shape = option.value;
            this.surface.requestDraw();
        } else {
            this.draftShape = option.value;
        }
    }

    addPart(): void {
        if (this.selectedItem || this.connectionSource) {
            this.connectionMessage = 'Click empty space before adding a part.';
            return;
        }
        const id = this.nextPartId++;
        const offset = 24 + ((id - 1) % 4) * 24;
        this.parts.push({ id, label: this.draftLabel, position: { x: offset, y: offset }, shape: this.draftShape });
        if (!this.customDraft) {
            this.draftLabel = `Part ${this.nextPartId}`;
        }
        this.surface.requestDraw();
    }

    get labelValue(): string {
        return this.selectedItem ? this.selectedItem.label : this.draftLabel;
    }

    get labelPurpose(): string {
        return this.selectedPart ? 'Part label'
            : this.selectedConnection ? 'Connection label' : 'Label for next part';
    }

    editLabel(label: string): void {
        if (this.connectionSource) {
            this.connectionMessage = 'Finish or cancel the connection before editing a label.';
            return;
        }
        if (this.selectedItem) {
            this.selectedItem.label = label;
            this.surface.requestDraw();
        } else {
            this.draftLabel = label;
            this.customDraft = true;
        }
    }

    movePointer(event: PointerEvent): void {
        if (this.surface.movePan(event)) return;
        const point = this.surface.point(event);
        this.pointerMoved.emit(point);
        if (this.marquee.move(event.pointerId, point)) {
            this.surface.requestDraw();
            return;
        }
        if (this.drag && this.drag.pointerId === event.pointerId) {
            const dx = point.x - this.drag.start.x;
            const dy = point.y - this.drag.start.y;
            if (dx !== 0 || dy !== 0) {
                this.drag.moved = true;
            }
            for (const { part, position } of this.drag.parts) {
                part.position = { x: position.x + dx, y: position.y + dy };
            }
            this.surface.requestDraw();
        }
    }

    selectPart(event: PointerEvent): void {
        if (event.button !== 0 || this.drag || this.marquee.active) {
            return;
        }
        const point = this.surface.point(event);
        const part = findPartAt(this.parts, point);
        if (this.connectionSource) {
            if (!part) {
                return;
            }
            if (part === this.connectionSource) {
                this.connectionMessage = 'Choose a different part.';
                return;
            }
            if (this.connections.some(connection =>
                (connection.first === this.connectionSource && connection.second === part)
                || (!this.technicalLoaded && connection.second === this.connectionSource && connection.first === part))) {
                this.connectionMessage = 'These parts are already connected.';
                return;
            }
            this.connections.push({
                id: this.nextConnectionId++,
                first: this.connectionSource,
                second: part,
                label: '',
                directed: this.technicalLoaded,
            });
            this.cancelConnection();
            this.surface.requestDraw();
            return;
        }
        const item = part ?? findConnectionAt(this.connections, point);
        if (!item && event.ctrlKey) {
            this.surface.beginPan(event);
            return;
        }
        const wasSelected = item !== undefined && this.selection.has(item);
        if (!item) {
            this.surface.capturePointer(event.pointerId);
            this.marquee.begin(event.pointerId, point);
        } else {
            this.checkItem(item, part ? true : !wasSelected);
        }
        if (part) {
            this.surface.capturePointer(event.pointerId);
            this.drag = {
                part,
                pointerId: event.pointerId,
                start: point,
                parts: [...this.checkedParts].map(part => ({ part, position: { ...part.position } })),
                deselectOnClick: wasSelected,
                moved: false,
            };
        }
        this.surface.requestDraw();
    }

    endDrag(event: PointerEvent): void {
        this.surface.endPan(event);
        if (this.marquee.active && this.marquee.end(event, this.surface.point(event),
            this.parts, this.connections, this.selection)) this.surface.requestDraw();
        if (this.drag?.pointerId === event.pointerId) {
            // Defer deselection until release so dragging never unchecks the part.
            if (event.type === 'pointerup' && this.drag.deselectOnClick && !this.drag.moved) {
                this.checkItem(this.drag.part, false);
            }
            this.drag = undefined;
        }
    }

    startConnection(): void {
        if (!this.selectedPart) {
            this.connectionMessage = 'Select a part before connecting.';
            return;
        }
        this.drag = undefined;
        if (this.marquee.active) this.surface.requestDraw();
        this.marquee.cancel();
        this.connectionSource = this.selectedPart;
        this.connectionMessage = 'Click a different part to connect, or Cancel.';
    }

    cancelConnection(): void {
        this.connectionSource = undefined;
        this.connectionMessage = '';
    }

    renameConnection(connection: SketchConnection, label: string): void {
        connection.label = label;
        this.surface.requestDraw();
    }

    removeConnection(connection: SketchConnection): void {
        this.selection.remove(connection);
        this.connections = this.connections.filter(candidate => candidate !== connection);
        this.surface.requestDraw();
    }

    renamePart(label: string): void {
        if (this.selectedPart) {
            this.selectedPart.label = label;
            this.surface.requestDraw();
        }
    }

    removeSelectedPart(): void {
        if (this.selectedPart) {
            this.removePart(this.selectedPart);
        }
    }

    private removePart(removed: SketchPart): void {
        this.selection.remove(removed);
        for (const connection of this.connections.filter(connection =>
            connection.first === removed || connection.second === removed)) {
            this.removeConnection(connection);
        }
        this.cancelConnection();
        this.parts = this.parts.filter(part => part !== removed);
        this.boundaries = this.boundaries
            .map(boundary => ({ ...boundary, parts: boundary.parts.filter(part => part !== removed) }))
            .filter(boundary => boundary.parts.length > 0);
        this.drag = undefined;
        this.surface.requestDraw();
    }

    ngAfterViewInit(): void {
        this.surface.initialize(this.canvas.nativeElement, this.render, true);
    }

    ngOnDestroy(): void {
        this.marquee.cancel();
        this.surface.destroy();
    }

    private readonly render: Parameters<ICanvas['initialize']>[1] = context => {
        renderSketch(context, {
            parts: this.parts,
            connections: this.connections,
            boundaries: this.boundaries,
            selection: this.selection,
            technicalLoaded: this.technicalLoaded,
            overviewLoaded: this.overviewLoaded,
            marquee: this.marquee.bounds,
        });
    }
}
