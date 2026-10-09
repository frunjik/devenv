import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild, inject } from '@angular/core';
import { CANVAS } from './canvas';
import type { ICanvas } from './canvas';
import { InteractiveCanvas } from './interactive-canvas';
import { SCHEDULER } from '../../scheduler';
import { validateDiagramDocument } from '@shared';
import overview from './devenv-overview.json';

interface SketchPart {
    readonly id: number;
    label: string;
    position: { x: number; y: number };
}

interface CanvasDrag {
    part: SketchPart;
    pointerId: number;
    offset: { x: number; y: number };
}

interface SketchConnection {
    readonly id: number;
    first: SketchPart;
    second: SketchPart;
    label: string;
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
    private selectedItem: SketchPart | SketchConnection | undefined;
    connections: SketchConnection[] = [];
    connectionSource: SketchPart | undefined;
    connectionMessage = '';
    private nextConnectionId = 1;
    private nextPartId = 1;
    private draftLabel = 'Part 1';
    private customDraft = false;
    private drag: CanvasDrag | undefined;
    overviewLoaded = false;
    replacementPending = false;
    readonly checkedConnections = new Set<SketchConnection>();

    checkConnection(connection: SketchConnection, checked: boolean): void {
        if (checked) {
            this.checkedConnections.add(connection);
        } else {
            this.checkedConnections.delete(connection);
        }
    }

    deleteCheckedConnections(): void {
        for (const connection of this.checkedConnections) {
            this.removeConnection(connection);
        }
        this.checkedConnections.clear();
    }

    loadOverview(): void {
        if (this.parts.length) {
            this.replacementPending = true;
            return;
        }
        this.confirmOverview();
    }

    cancelOverview(): void {
        this.replacementPending = false;
    }

    confirmOverview(): void {
        const document = validateDiagramDocument(overview);
        this.checkedConnections.clear();
        this.parts = document.elements.map(element => ({
            id: this.nextPartId++,
            label: element.label,
            position: { ...element.position },
        }));
        this.connections = document.connections.map(connection => ({
            id: this.nextConnectionId++,
            first: this.parts[document.elements.findIndex(element => element.id === connection.sourceElementId)],
            second: this.parts[document.elements.findIndex(element => element.id === connection.targetElementId)],
            label: connection.label,
        }));
        this.selectedItem = undefined;
        this.drag = undefined;
        this.cancelConnection();
        this.overviewLoaded = true;
        this.replacementPending = false;
        this.surface.requestDraw();
    }

    get selectedPart(): SketchPart | undefined {
        return this.selectedItem && 'position' in this.selectedItem ? this.selectedItem : undefined;
    }

    get selectedConnection(): SketchConnection | undefined {
        return this.selectedItem && 'first' in this.selectedItem ? this.selectedItem : undefined;
    }

    addPart(): void {
        if (this.selectedItem || this.connectionSource) {
            this.connectionMessage = 'Click empty space before adding a part.';
            return;
        }
        const id = this.nextPartId++;
        const offset = 24 + ((id - 1) % 4) * 24;
        this.parts.push({ id, label: this.draftLabel, position: { x: offset, y: offset } });
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
            this.drag.part.position = { x: point.x - this.drag.offset.x, y: point.y - this.drag.offset.y };
            this.surface.requestDraw();
        }
    }

    selectPart(event: PointerEvent): void {
        if (event.button !== 0 || this.drag) {
            return;
        }
        const point = this.surface.point(event);
        const part = [...this.parts].reverse().find(candidate =>
            point.x >= candidate.position.x && point.x <= candidate.position.x + 180
            && point.y >= candidate.position.y && point.y <= candidate.position.y + 80);
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
                || (connection.second === this.connectionSource && connection.first === part))) {
                this.connectionMessage = 'These parts are already connected.';
                return;
            }
            this.connections.push({
                id: this.nextConnectionId++,
                first: this.connectionSource,
                second: part,
                label: '',
            });
            this.cancelConnection();
            this.surface.requestDraw();
            return;
        }
        this.selectedItem = part ?? [...this.connections].reverse().find(connection => {
            const { first, second } = this.connectionLine(connection);
            const dx = second.x - first.x;
            const dy = second.y - first.y;
            const lengthSquared = dx * dx + dy * dy;
            const projection = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1,
                ((point.x - first.x) * dx + (point.y - first.y) * dy) / lengthSquared));
            return Math.hypot(point.x - first.x - projection * dx, point.y - first.y - projection * dy) <= 6;
        });
        if (part) {
            this.surface.capturePointer(event.pointerId);
            this.drag = {
                part,
                pointerId: event.pointerId,
                offset: { x: point.x - part.position.x, y: point.y - part.position.y },
            };
        }
        this.surface.requestDraw();
    }

    endDrag(event: PointerEvent): void {
        if (this.drag?.pointerId === event.pointerId) {
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
        this.checkedConnections.delete(connection);
        this.connections = this.connections.filter(candidate => candidate !== connection);
        if (this.selectedItem === connection) {
            this.selectedItem = undefined;
        }
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
            const removed = this.selectedPart;
            for (const connection of this.connections.filter(connection =>
                connection.first === removed || connection.second === removed)) {
                this.removeConnection(connection);
            }
            this.cancelConnection();
            this.parts = this.parts.filter(part => part !== this.selectedPart);
            this.selectedItem = undefined;
            this.drag = undefined;
            this.surface.requestDraw();
        }
    }

    ngAfterViewInit(): void {
        this.surface.initialize(this.canvas.nativeElement, this.render);
        this.stopRefresh = this.scheduler.every(1000, () => this.surface.requestDraw());
    }

    ngOnDestroy(): void {
        this.stopRefresh?.();
        this.surface.destroy();
    }

    private connectionLine(connection: SketchConnection) {
        const first = { x: connection.first.position.x + 90, y: connection.first.position.y + 40 };
        const second = { x: connection.second.position.x + 90, y: connection.second.position.y + 40 };
        const dx = second.x - first.x;
        const dy = second.y - first.y;
        const scale = dx === 0 && dy === 0 ? 0 : Math.min(0.5, 90 / Math.abs(dx), 40 / Math.abs(dy));
        return {
            first: { x: first.x + dx * scale, y: first.y + dy * scale },
            second: { x: second.x - dx * scale, y: second.y - dy * scale },
        };
    }

    private readonly render: Parameters<ICanvas['initialize']>[1] = (context, width, height) => {
        context.textAlign = 'center';
        context.textBaseline = 'middle';
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
        for (const connection of this.connections) {
            const { first, second } = this.connectionLine(connection);
            context.lineWidth = connection === this.selectedConnection ? 3 : 1;
            context.beginPath();
            context.moveTo(first.x, first.y);
            context.lineTo(second.x, second.y);
            context.stroke();
            context.font = '14px sans-serif';
            context.fillText(connection.label, (first.x + second.x) / 2, (first.y + second.y) / 2 - 10);
        }
        for (const part of this.parts) {
            const { x, y } = part.position;
            context.lineWidth = part === this.selectedPart ? 3 : 1;
            context.strokeRect(x, y, 180, 80);
            context.font = '16px sans-serif';
            if (this.overviewLoaded) {
                context.fillText(part.label, x + 90, y + 40, 164);
            } else {
                context.fillText(part.label, x + 90, y + 40);
            }
        }
    }
}
