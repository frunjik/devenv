import type { SketchConnection, SketchItem, SketchPart } from './sketch.types';

export class SketchSelection {
    private readonly items = new Set<SketchItem>();

    get active(): SketchItem | undefined {
        return [...this.items].at(-1);
    }

    get parts(): ReadonlySet<SketchPart> {
        return new Set([...this.items].filter((item): item is SketchPart => 'position' in item));
    }

    get connections(): ReadonlySet<SketchConnection> {
        return new Set([...this.items].filter((item): item is SketchConnection => 'first' in item));
    }

    has(item: SketchItem): boolean {
        return this.items.has(item);
    }

    check(item: SketchItem, checked: boolean): void {
        this.items.delete(item);
        if (checked) {
            this.items.add(item);
        }
    }

    remove(item: SketchItem): void {
        this.items.delete(item);
    }

    clear(): void {
        this.items.clear();
    }
}
