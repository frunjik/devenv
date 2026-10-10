import type { PartShape } from './sketch.types';

export const shapeLabels: Record<PartShape, string> = {
    rectangle: 'Rectangle',
    artifact: 'Artifact',
    'system-software': 'System software',
    'business-role': 'Business role',
    product: 'Product',
    actor: 'Actor',
    'tech-process': 'Tech process',
};

interface ShapeOption {
    value: PartShape;
    label: string;
}

const shapes: PartShape[] = [
    'rectangle', 'artifact', 'system-software', 'business-role', 'product', 'actor', 'tech-process',
];

export const shapeOptions: readonly ShapeOption[] = shapes.map(value => ({ value, label: shapeLabels[value] }));
