import type { CanvasRenderContext } from './canvas';

export interface SymbolPoint {
    x: number;
    y: number;
}

export interface SymbolBounds extends SymbolPoint {
    width: number;
    height: number;
}

const green = '#269b45';
const orange = '#d98200';

function validateBounds(bounds: SymbolBounds): void {
    if (![bounds.x, bounds.y, bounds.width, bounds.height].every(Number.isFinite) || bounds.width < 60 || bounds.height < 60) {
        throw new Error('Canvas symbol bounds require finite coordinates and width/height of at least 60 pixels.');
    }
}

function path(context: CanvasRenderContext, points: SymbolPoint[]): void {
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (const point of points.slice(1)) context.lineTo(point.x, point.y);
}

function rectangle(bounds: SymbolBounds): SymbolPoint[] {
    const { x, y, width, height } = bounds;
    return [{ x, y }, { x: x + width, y }, { x: x + width, y: y + height }, { x, y: y + height }, { x, y }];
}

function ellipse(x: number, y: number, rx: number, ry: number): SymbolPoint[] {
    return Array.from({ length: 33 }, (_, index) => ({
        x: x + rx * Math.cos(index * Math.PI / 16),
        y: y + ry * Math.sin(index * Math.PI / 16),
    }));
}

function hatch(context: CanvasRenderContext, bounds: SymbolBounds, outline: SymbolPoint[], color: string, crossHatch = false): void {
    context.save();
    try {
        path(context, outline);
        context.clip();
        context.strokeStyle = color;
        context.lineWidth = .6;
        for (let offset = -bounds.height; offset < bounds.width; offset += 6) {
            path(context, [
                { x: bounds.x + offset, y: bounds.y + bounds.height },
                { x: bounds.x + offset + bounds.height, y: bounds.y },
            ]);
            context.stroke();
            if (crossHatch) {
                path(context, [
                    { x: bounds.x + offset, y: bounds.y },
                    { x: bounds.x + offset + bounds.height, y: bounds.y + bounds.height },
                ]);
                context.stroke();
            }
        }
    } finally {
        context.restore();
    }
}

function labels(context: CanvasRenderContext, bounds: SymbolBounds, lines: readonly string[], color: string): void {
    context.fillStyle = color;
    context.font = '20px cursive';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    lines.forEach((line, index) => {
        context.fillText(line, bounds.x + bounds.width / 2,
            bounds.y + bounds.height / 2 + (index - (lines.length - 1) / 2) * 26 + 6, bounds.width - 20);
    });
}

type CornerIcon = (context: CanvasRenderContext, x: number, y: number) => void;

function box(context: CanvasRenderContext, bounds: SymbolBounds, lines: readonly string[], color: string, icon: CornerIcon): void {
    validateBounds(bounds);
    context.save();
    try {
        hatch(context, bounds, rectangle(bounds), `${color}70`);
        context.strokeStyle = color;
        context.lineWidth = 1.5;
        context.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        icon(context, bounds.x + bounds.width - 30, bounds.y + 8);
        labels(context, bounds, lines, color);
    } finally {
        context.restore();
    }
}

export function drawArtifact(context: CanvasRenderContext, bounds: SymbolBounds, lines: readonly string[]): void {
    box(context, bounds, lines, green, (ctx, x, y) => {
        path(ctx, [{ x, y }, { x: x + 12, y }, { x: x + 20, y: y + 8 }, { x: x + 20, y: y + 24 }, { x, y: y + 24 }, { x, y }]);
        ctx.stroke();
        path(ctx, [{ x: x + 12, y }, { x: x + 12, y: y + 8 }, { x: x + 20, y: y + 8 }]);
        ctx.stroke();
    });
}

export function drawSystemSoftware(context: CanvasRenderContext, bounds: SymbolBounds, lines: readonly string[]): void {
    box(context, bounds, lines, green, (ctx, x, y) => {
        path(ctx, ellipse(x + 13, y + 9, 11, 8));
        ctx.stroke();
        path(ctx, ellipse(x + 8, y + 13, 11, 8));
        ctx.stroke();
    });
}

export function drawBusinessRole(context: CanvasRenderContext, bounds: SymbolBounds, lines: readonly string[]): void {
    box(context, bounds, lines, orange, (ctx, x, y) => {
        ctx.strokeRect(x - 6, y, 28, 12);
        path(ctx, [{ x: x - 1, y }, { x: x - 1, y: y + 12 }]);
        ctx.stroke();
    });
}

export function drawProduct(context: CanvasRenderContext, bounds: SymbolBounds, lines: readonly string[]): void {
    box(context, bounds, lines, orange, (ctx, _x, _y) => {
        ctx.strokeRect(bounds.x, bounds.y, bounds.width / 2, 18);
    });
}

export function drawActor(context: CanvasRenderContext, bounds: SymbolBounds, label: string): void {
    validateBounds(bounds);
    context.save();
    try {
        const radius = Math.min(bounds.width * .15, bounds.height * .1);
        const head = ellipse(bounds.x + bounds.width / 2, bounds.y + bounds.height * .13, radius, radius);
        const body = [
            { x: bounds.x + bounds.width * .15, y: bounds.y + bounds.height * .75 },
            { x: bounds.x + bounds.width * .25, y: bounds.y + bounds.height * .45 },
            { x: bounds.x + bounds.width * .4, y: bounds.y + bounds.height * .28 },
            { x: bounds.x + bounds.width * .6, y: bounds.y + bounds.height * .28 },
            { x: bounds.x + bounds.width * .75, y: bounds.y + bounds.height * .45 },
            { x: bounds.x + bounds.width * .85, y: bounds.y + bounds.height * .75 },
            { x: bounds.x + bounds.width * .15, y: bounds.y + bounds.height * .75 },
        ];
        for (const outline of [head, body]) {
            hatch(context, bounds, outline, '#bac4d3', true);
            context.strokeStyle = '#202020';
            context.lineWidth = 2;
            path(context, outline);
            context.stroke();
        }
        labels(context, { ...bounds, y: bounds.y + bounds.height * .8, height: bounds.height * .15 }, [label], '#202020');
    } finally {
        context.restore();
    }
}

export function drawSymbolConnection(context: CanvasRenderContext, source: SymbolPoint, target: SymbolPoint): void {
    if (![source.x, source.y, target.x, target.y].every(Number.isFinite)) {
        throw new Error('Canvas symbol connections require finite coordinates.');
    }
    context.save();
    try {
        context.strokeStyle = '#202020';
        context.lineWidth = 2;
        path(context, [source, target]);
        context.stroke();
    } finally {
        context.restore();
    }
}

export function drawSymbolPreview(context: CanvasRenderContext, width: number, height: number): void {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width < 160 || height < 900) {
        throw new Error('Canvas symbol preview requires at least 160 x 900 logical pixels.');
    }
    const narrow = width < 640;
    const margin = 20;
    const boxWidth = narrow ? width - margin * 2 : (width - margin * 4) / 3;
    const items = [
        { draw: drawArtifact, lines: ['Artifact:', '<AI Workflow>'] },
        { draw: drawArtifact, lines: ['Artifact:', '<TaskScore(RICE)>'] },
        { draw: drawSystemSoftware, lines: ['System software:', '<Name>'] },
        { draw: drawBusinessRole, lines: ['Business role:', '<name>'] },
        { draw: drawProduct, lines: ['Product:', '<name>'] },
    ];
    drawActor(context, { x: narrow ? (width - 80) / 2 : margin + 30, y: narrow ? 20 : 280, width: 80, height: 120 }, 'Dev');
    items.forEach((item, index) => {
        const x = narrow ? margin : index < 2 ? margin + (index + 1) * (boxWidth + margin) : margin + (index - 2) * (boxWidth + margin);
        const y = narrow ? 170 + index * 145 : index < 2 ? 60 + index * 120 : 650;
        if (index === 1) drawSymbolConnection(context,
            { x: x + boxWidth / 2, y: y - 40 }, { x: x + boxWidth / 2, y });
        item.draw(context, { x, y, width: boxWidth, height: 100 }, item.lines);
    });
}
