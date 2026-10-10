import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild, inject } from '@angular/core';
import { CANVAS } from './canvas';
import type { ICanvas } from './canvas';
import { InteractiveCanvas } from './interactive-canvas';
import { SCHEDULER } from '../../scheduler';
import { validateDiagramDocument } from '@shared';
import overview from './devenv-overview.json';
import { createTechnicalPicture } from './technical-picture';
import { drawActor, drawArtifact, drawBusinessRole, drawProduct, drawSystemSoftware, drawTechProcess } from './canvas-symbols';
import type { SymbolBounds } from './canvas-symbols';
import { createDefaultTemplate } from './default-template';
import type { TemplateShape } from './default-template';

type PictureKind = 'overview' | 'technical' | 'template';
type PartShape = 'rectangle' | TemplateShape;

const symbolRenderers = {
    artifact: { draw: drawArtifact, heading: 'Artifact:' },
    'system-software': { draw: drawSystemSoftware, heading: 'System software:' },
    'business-role': { draw: drawBusinessRole, heading: 'Business role:' },
    product: { draw: drawProduct, heading: 'Product:' },
    'tech-process': { draw: drawTechProcess, heading: 'Tech process:' },
};

interface SketchPart {
    readonly id: number;
    label: string;
    position: { x: number; y: number };
    technology?: string;
    description?: string;
    shape?: PartShape;
}

interface CanvasDrag {
    part: SketchPart;
    pointerId: number;
    offset: { x: number; y: number };
    deselectOnClick: boolean;
    moved: boolean;
}

interface SketchConnection {
    readonly id: number;
    first: SketchPart;
    second: SketchPart;
    label: string;
    directed?: boolean;
    technology?: string;
    labelOffset?: { x: number; y: number };
}

interface SketchBoundary {
    label: string;
    parts: SketchPart[];
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
    private stopRefresh: (() => void) | undefined;
    private readonly scheduler = inject(SCHEDULER);
    private readonly surface = inject(CANVAS);
    parts: SketchPart[] = [];
    private readonly selectedItems = new Set<SketchPart | SketchConnection>();
    private get selectedItem(): SketchPart | SketchConnection | undefined {
        return [...this.selectedItems].at(-1);
    }
    connections: SketchConnection[] = [];
    connectionSource: SketchPart | undefined;
    connectionMessage = '';
    private nextConnectionId = 1;
    private nextPartId = 1;
    private draftLabel = 'Part 1';
    private customDraft = false;
    private draftShape: PartShape = 'rectangle';
    readonly shapeOptions: { value: PartShape; label: string }[] = [
        { value: 'rectangle', label: 'Rectangle' },
        { value: 'artifact', label: 'Artifact' },
        { value: 'system-software', label: 'System software' },
        { value: 'business-role', label: 'Business role' },
        { value: 'product', label: 'Product' },
        { value: 'actor', label: 'Actor' },
        { value: 'tech-process', label: 'Tech process' },
    ];
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
        return new Set([...this.selectedItems].filter((item): item is SketchPart => 'position' in item));
    }
    get checkedConnections(): ReadonlySet<SketchConnection> {
        return new Set([...this.selectedItems].filter((item): item is SketchConnection => 'first' in item));
    }

    checkPart(part: SketchPart, checked: boolean): void {
        this.checkItem(part, checked);
    }

    checkConnection(connection: SketchConnection, checked: boolean): void {
        this.checkItem(connection, checked);
    }

    private checkItem(item: SketchPart | SketchConnection, checked: boolean): void {
        this.selectedItems.delete(item);
        if (checked) {
            this.selectedItems.add(item);
        }
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
        this.selectedItems.clear();
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
        const point = this.surface.point(event);
        this.pointerMoved.emit(point);
        if (this.drag && this.drag.pointerId === event.pointerId) {
            if (point.x !== this.drag.part.position.x + this.drag.offset.x
                || point.y !== this.drag.part.position.y + this.drag.offset.y) {
                this.drag.moved = true;
            }
            this.drag.part.position = { x: point.x - this.drag.offset.x, y: point.y - this.drag.offset.y };
            this.surface.requestDraw();
        }
    }

    selectPart(event: PointerEvent): void {
        if (event.button !== 0 || this.drag) {
            return;
        }
        const point = this.surface.point(event);
        const part = [...this.parts].reverse().find(candidate => {
            const bounds = this.partBounds(candidate);
            return point.x >= bounds.x && point.x <= bounds.x + bounds.width
                && point.y >= bounds.y && point.y <= bounds.y + bounds.height;
        });
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
        const item = part ?? [...this.connections].reverse().find(connection => {
            const { first, second } = this.connectionLine(connection);
            const dx = second.x - first.x;
            const dy = second.y - first.y;
            const lengthSquared = dx * dx + dy * dy;
            const projection = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1,
                ((point.x - first.x) * dx + (point.y - first.y) * dy) / lengthSquared));
            return Math.hypot(point.x - first.x - projection * dx, point.y - first.y - projection * dy) <= 6;
        });
        const wasSelected = item !== undefined && this.selectedItems.has(item);
        if (!item) {
            this.selectedItems.clear();
        } else {
            this.checkItem(item, part ? true : !wasSelected);
        }
        if (part) {
            this.surface.capturePointer(event.pointerId);
            this.drag = {
                part,
                pointerId: event.pointerId,
                offset: { x: point.x - part.position.x, y: point.y - part.position.y },
                deselectOnClick: wasSelected,
                moved: false,
            };
        }
        this.surface.requestDraw();
    }

    endDrag(event: PointerEvent): void {
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
        this.selectedItems.delete(connection);
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
        this.selectedItems.delete(removed);
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
        this.surface.initialize(this.canvas.nativeElement, this.render);
        this.stopRefresh = this.scheduler.every(1000, () => this.surface.requestDraw());
    }

    ngOnDestroy(): void {
        this.stopRefresh?.();
        this.surface.destroy();
    }

    private partBounds(part: SketchPart): SymbolBounds {
        const { x, y } = part.position;
        // Preserve the actor's existing center while tightening its interaction bounds.
        return part.shape === 'actor'
            ? { x: x + 60, y: y - 10, width: 60, height: 100 }
            : { x, y, width: 180, height: 80 };
    }

    private connectionLine(connection: SketchConnection) {
        const firstBounds = this.partBounds(connection.first);
        const secondBounds = this.partBounds(connection.second);
        const first = { x: firstBounds.x + firstBounds.width / 2, y: firstBounds.y + firstBounds.height / 2 };
        const second = { x: secondBounds.x + secondBounds.width / 2, y: secondBounds.y + secondBounds.height / 2 };
        const dx = second.x - first.x;
        const dy = second.y - first.y;
        const firstScale = dx === 0 && dy === 0 ? 0
            : Math.min(0.5, firstBounds.width / 2 / Math.abs(dx), firstBounds.height / 2 / Math.abs(dy));
        const secondScale = dx === 0 && dy === 0 ? 0
            : Math.min(0.5, secondBounds.width / 2 / Math.abs(dx), secondBounds.height / 2 / Math.abs(dy));
        return {
            first: { x: first.x + dx * firstScale, y: first.y + dy * firstScale },
            second: { x: second.x - dx * secondScale, y: second.y - dy * secondScale },
        };
    }

    private readonly render: Parameters<ICanvas['initialize']>[1] = (context, width, height) => {
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        if (!this.technicalLoaded) {
            context.font = '24px sans-serif';
            context.fillText(
                new Date().toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                }),
                width / 2,
                height / 2,
            );
        }
        for (const boundary of this.boundaries) {
            const bounds = boundary.parts.map(part => this.partBounds(part));
            const left = Math.min(...bounds.map(part => part.x)) - 28;
            const top = Math.min(...bounds.map(part => part.y)) - 48;
            const right = Math.max(...bounds.map(part => part.x + part.width)) + 28;
            const bottom = Math.max(...bounds.map(part => part.y + part.height)) + 28;
            context.lineWidth = 1;
            context.strokeRect(left, top, right - left, bottom - top);
            context.font = '16px sans-serif';
            context.fillText(boundary.label, (left + right) / 2, top + 20, right - left - 16);
        }
        for (const part of this.parts) {
            const { x, y } = part.position;
            if (part.shape && part.shape !== 'rectangle') {
                const bounds = this.partBounds(part);
                if (part.shape === 'actor') {
                    // Keep the drawing in place inside the padded interaction bounds.
                    drawActor(context, { ...bounds, y, height: 80 }, part.label);
                } else {
                    const symbol = symbolRenderers[part.shape];
                    symbol.draw(context, bounds, [symbol.heading, `<${part.label}>`]);
                }
                if (this.selectedItems.has(part)) {
                    context.lineWidth = 3;
                    context.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
                }
                continue;
            }
            context.lineWidth = this.selectedItems.has(part) ? 3 : 1;
            context.strokeRect(x, y, 180, 80);
            context.font = '16px sans-serif';
            if (this.technicalLoaded) {
                this.drawWrappedText(context, part.label, x + 90, y + 24, 22, 16, 164);
                if (part.technology) {
                    context.font = '12px sans-serif';
                    context.fillText(part.technology, x + 90, y + 64, 164);
                }
            } else if (this.overviewLoaded) {
                context.fillText(part.label, x + 90, y + 40, 164);
            } else {
                context.fillText(part.label, x + 90, y + 40);
            }
        }
        for (const connection of this.connections) {
            const { first, second } = this.connectionLine(connection);
            context.lineWidth = this.selectedItems.has(connection) ? 3 : 1;
            context.beginPath();
            context.moveTo(first.x, first.y);
            context.lineTo(second.x, second.y);
            context.stroke();
            const dx = second.x - first.x;
            const dy = second.y - first.y;
            const length = Math.hypot(dx, dy);
            if (connection.directed && length > 0) {
                const ux = dx / length;
                const uy = dy / length;
                context.beginPath();
                context.moveTo(second.x - 10 * ux + 5 * uy, second.y - 10 * uy - 5 * ux);
                context.lineTo(second.x, second.y);
                context.lineTo(second.x - 10 * ux - 5 * uy, second.y - 10 * uy + 5 * ux);
                context.stroke();
            }
            context.font = '14px sans-serif';
            const labelX = (first.x + second.x) / 2;
            const labelY = (first.y + second.y) / 2;
            if (this.technicalLoaded) {
                const textX = labelX + (connection.labelOffset?.x ?? 0);
                const textY = labelY + (connection.labelOffset?.y ?? -40);
                this.drawWrappedText(context, connection.label, textX, textY, 26, 16, 240);
                if (connection.technology) {
                    context.font = '12px sans-serif';
                    this.drawWrappedText(context, connection.technology, textX, textY + 48, 30, 14, 240);
                }
            } else {
                context.fillText(connection.label, labelX, labelY - 10);
            }
        }
    }

    private drawWrappedText(
        context: Parameters<Parameters<ICanvas['initialize']>[1]>[0],
        text: string, x: number, y: number, characters: number, lineHeight: number, maxWidth: number,
    ): void {
        let line = '';
        for (const word of text.split(/\s+/)) {
            if (line && line.length + word.length + 1 > characters) {
                context.fillText(line, x, y, maxWidth);
                y += lineHeight;
                line = word;
            } else {
                line += (line ? ' ' : '') + word;
            }
        }
        context.fillText(line, x, y, maxWidth);
    }
}
