import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { createAgentGuidePreview } from './agent-guide-preview';
import { MarkdownPreviewComponent } from '../markdown-preview/markdown-preview.component';

@Component({
    selector: 'app-agent-guide',
    standalone: true,
    imports: [MatTabsModule, MarkdownPreviewComponent],
    templateUrl: './agent-guide.component.html',
    styleUrl: './agent-guide.component.scss',
})
export class AgentGuideComponent {
    readonly preview = createAgentGuidePreview();
    readonly previewPaths = new Set(this.preview.files.map(file => file.path));
}
