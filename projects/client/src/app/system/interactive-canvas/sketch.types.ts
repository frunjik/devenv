import type { TemplateShape } from './default-template';

export type PartShape = 'rectangle' | TemplateShape;

export interface SketchPart {
    readonly id: number;
    label: string;
    position: { x: number; y: number };
    technology?: string;
    description?: string;
    shape?: PartShape;
}

export interface SketchConnection {
    readonly id: number;
    first: SketchPart;
    second: SketchPart;
    label: string;
    directed?: boolean;
    technology?: string;
    labelOffset?: { x: number; y: number };
}

export interface SketchBoundary {
    label: string;
    parts: SketchPart[];
}

export type SketchItem = SketchPart | SketchConnection;
