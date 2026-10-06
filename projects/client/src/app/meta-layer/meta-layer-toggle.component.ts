import { Component, inject } from '@angular/core';
import { MetaLayerService } from './meta-layer.service';

@Component({
    selector: 'app-meta-layer-toggle',
    standalone: true,
    templateUrl: './meta-layer-toggle.component.html',
    styleUrl: './meta-layer-toggle.component.scss',
})
export class MetaLayerToggleComponent {
    protected readonly meta = inject(MetaLayerService);
}
