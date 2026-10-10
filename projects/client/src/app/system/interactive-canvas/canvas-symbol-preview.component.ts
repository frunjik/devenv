import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CANVAS, type ICanvas } from './canvas';
import { InteractiveCanvas } from './interactive-canvas';
import { drawSymbolPreview } from './canvas-symbols';

@Component({
    selector: 'app-canvas-symbol-preview',
    standalone: true,
    imports: [RouterLink],
    providers: [{ provide: CANVAS, useClass: InteractiveCanvas }],
    template: `
        <main class="layout-page">
            <header>
                <h1>Canvas architecture symbols</h1>
                <p>Reusable vector symbols inspired by the reference sketch.</p>
                <a routerLink="/interactive-canvas">Back to the canvas editor</a>
            </header>
            @if (error()) {
                <p role="alert">{{ error() }}</p>
            }
            <figure>
                <canvas #canvas role="img" aria-label="Sample architecture symbols: artifacts, system software, business role, product and developer">
                    Architecture symbol preview: two artifacts, system software, a business role, a product and a developer.
                </canvas>
                <figcaption>
                    Artifact: AI Workflow and TaskScore (RICE). System software, Business role,
                    Product and Dev. Green symbols represent technical elements; orange symbols
                    represent business elements. This read-only preview does not change saved diagrams.
                </figcaption>
            </figure>
        </main>
    `,
    styles: [`
        :host { display: block; }
        header { margin-bottom: var(--layout-space-section); }
        h1, p { margin-top: 0; }
        figure { margin: 0; }
        canvas { display: block; width: 100%; height: 900px; background: #fff; outline: 1px solid var(--border-default); }
        figcaption { margin-top: var(--layout-space-small); color: var(--text-secondary); }
        [role="alert"] { color: var(--state-error); }
    `],
})
export class CanvasSymbolPreviewComponent implements AfterViewInit, OnDestroy {
    @ViewChild('canvas', { static: true }) private canvas!: ElementRef<HTMLCanvasElement>;
    private readonly surface = inject(CANVAS);
    readonly error = signal('');

    ngAfterViewInit(): void {
        try {
            this.surface.initialize(this.canvas.nativeElement, this.render);
        } catch (error: unknown) {
            this.error.set(error instanceof Error ? error.message : String(error));
        }
    }

    ngOnDestroy(): void {
        this.surface.destroy();
    }

    private readonly render: Parameters<ICanvas['initialize']>[1] = (context, width, height) => {
        try {
            drawSymbolPreview(context, width, height);
            this.error.set('');
        } catch (error: unknown) {
            this.error.set(error instanceof Error ? error.message : String(error));
        }
    };
}
