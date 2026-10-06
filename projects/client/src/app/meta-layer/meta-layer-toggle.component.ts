import { Component, inject } from '@angular/core';
import { MetaLayerService } from './meta-layer.service';

@Component({
    selector: 'app-meta-layer-toggle',
    standalone: true,
    template: `
        <button
            type="button"
            [class.active]="meta.enabled()"
            [attr.aria-pressed]="meta.enabled()"
            [attr.aria-label]="meta.enabled() ? 'Hide meta layer' : 'Show meta layer'"
            [title]="meta.enabled() ? 'Hide meta layer' : 'Show meta layer'"
            (click)="meta.toggle()"
        >◈</button>
    `,
    styles: `
        :host {
            display: inline-flex;
        }

        button {
            width: 1.5rem;
            height: 1.5rem;
            padding: 0;
            border: 1px solid #37443b;
            border-radius: 50%;
            background: transparent;
            color: #8b998e;
            font-size: 0.8rem;
            line-height: 1;
            cursor: pointer;
            transition: color 120ms ease, border-color 120ms ease, background-color 120ms ease;
        }

        button:hover,
        button:focus-visible {
            border-color: #596b5d;
            color: #aebbb0;
        }

        button:focus-visible {
            outline: 2px solid #a8c4ae;
            outline-offset: 2px;
        }

        button.active {
            border-color: #596b5d;
            background: #26332b;
            color: #a8c4ae;
        }
    `,
})
export class MetaLayerToggleComponent {
    protected readonly meta = inject(MetaLayerService);
}
