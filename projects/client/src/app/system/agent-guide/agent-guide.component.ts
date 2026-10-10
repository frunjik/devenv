import { Component } from '@angular/core';
import { createAgentGuidePreview } from './agent-guide-preview';

@Component({
    selector: 'app-agent-guide',
    standalone: true,
    templateUrl: './agent-guide.component.html',
    styleUrl: './agent-guide.component.scss',
})
export class AgentGuideComponent {
    readonly preview = createAgentGuidePreview();
}
