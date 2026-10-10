import { generateAgentGuidePreview } from '@shared';
import type { AgentGuidePreview } from '@shared';
import { agentPhaseGuide, agentPhaseSkills } from '../../../../../../knowledge/workflows/agent-phase-guide.types';
import { agentEssentials, agentEssentialsTesting } from '../../../../../../knowledge/practices/agent-essentials.types';

export function createAgentGuidePreview(): AgentGuidePreview {
    return generateAgentGuidePreview({
        guide: agentPhaseGuide,
        phaseSkills: agentPhaseSkills,
        essentials: agentEssentials,
        testing: agentEssentialsTesting,
    });
}
