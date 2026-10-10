import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { createAgentGuidePreview } from './agent-guide-preview';

@Component({
    selector: 'app-agent-guide',
    standalone: true,
    imports: [MatTabsModule],
    templateUrl: './agent-guide.component.html',
    styleUrl: './agent-guide.component.scss',
})
export class AgentGuideComponent {
    readonly preview = createAgentGuidePreview();
}
