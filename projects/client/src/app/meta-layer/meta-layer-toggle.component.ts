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
            position: fixed;
            z-index: 1100;
            right: 0.5rem;
            bottom: 3.5rem;
        }

        button {
            width: 1.75rem;
            height: 1.75rem;
            padding: 0;
            border: 1px solid rgb(0 0 0 / 25%);
            border-radius: 50%;
            background: rgb(255 255 255 / 70%);
            color: #555;
            font-size: 0.9rem;
            line-height: 1;
            opacity: 0.55;
            cursor: pointer;
        }

        button:hover,
        button:focus-visible,
        button.active {
            opacity: 1;
        }

        button.active {
            background: #3f51b5;
            color: #fff;
        }

        @media (max-width: 42rem) {
            :host { bottom: 5.75rem; }
        }
    `,
})
export class MetaLayerToggleComponent {
    protected readonly meta = inject(MetaLayerService);
}
