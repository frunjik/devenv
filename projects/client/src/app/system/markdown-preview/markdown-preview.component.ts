import { Component, computed, input } from '@angular/core';
import { renderMarkdownPreview } from './render-markdown-preview';

@Component({
    selector: 'app-markdown-preview',
    standalone: true,
    templateUrl: './markdown-preview.component.html',
    styleUrl: './markdown-preview.component.scss',
})
export class MarkdownPreviewComponent {
    readonly markdown = input.required<string>();
    readonly html = computed(() => renderMarkdownPreview(this.markdown()));
}
