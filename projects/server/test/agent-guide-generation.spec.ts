import { describe, expect, it } from '@jest/globals';
import { generateAgentGuidePreview } from '@shared';
import { agentPhaseGuide, agentPhaseSkills } from '../../../knowledge/workflows/agent-phase-guide.types';
import { agentEssentials, agentEssentialsTesting } from '../../../knowledge/practices/agent-essentials.types';
import { createAgentGuidePreview } from '../../client/src/app/system/agent-guide/agent-guide-preview';

const sources = {
    guide: agentPhaseGuide,
    phaseSkills: agentPhaseSkills,
    essentials: agentEssentials,
    testing: agentEssentialsTesting,
};

describe('shared agent guide generation', () => {
    it('retains repository safeguards in the always-on entry independently of the coordinator', () => {
        const entry = generateAgentGuidePreview(sources).files[0].content;
        expect(entry).toContain('## Repository safeguards');
        for (const safeguard of [
            'preserve unrelated work, intended behavior and stored formats',
            'never weaken them to hide regressions',
            'Validate external input at appropriate runtime boundaries',
            'Keep one authoritative source',
            'Ruleset changes require approval',
            'Commit only on explicit request',
            'exact short contribution-specific subject',
            'No Copilot co-author trailer',
            'Save decisions, open questions and next step',
            'UI design review remains opt-in',
        ]) {
            expect(entry).toContain(safeguard);
        }
        expect(entry).not.toContain('## Intents to explore');
        expect(entry).not.toContain('Trial changes in isolation before broad adoption');
    });
    it('links the project profile for project-specific rules instead of embedding them', () => {
        const entry = generateAgentGuidePreview(sources).files[0].content;
        expect(entry).toContain('[project profile](.github/instructions/project-profile.instructions.md)');
        for (const projectRule of ['valid in browser and server runtimes', 'npm run', '@jest/globals', 'knowledge/workflows']) {
            expect(entry).not.toContain(projectRule);
        }
    });
    it('does not claim repository instructions remain unchanged after installation', () => {
        const agent = generateAgentGuidePreview(sources).files.find(file => file.path.endsWith('.agent.md'))!;
        expect(agent.content).not.toContain('Active AGENTS.md remains unchanged');
        expect(agent.content).toContain('Generating these files does not install or activate them');
    });
    it('is available through the shared public API and preserves the client output in Node', () => {
        expect(generateAgentGuidePreview(sources)).toEqual(createAgentGuidePreview());
    });

    it('uses supplied records without mutating or retaining ownership of them', () => {
        const input = structuredClone(sources);
        input.guide.name = 'Example Guide';
        const before = JSON.stringify(input);
        const result = generateAgentGuidePreview(input);
        expect(JSON.stringify(input)).toBe(before);
        expect(result.files[1].content).toContain('# Example Guide');
        result.guide.name = 'Changed result';
        result.files[0].content = 'Changed output';
        expect(input.guide.name).toBe('Example Guide');
        expect(generateAgentGuidePreview(input).files[0].content).toContain('# Agent Essentials');
    });
});
