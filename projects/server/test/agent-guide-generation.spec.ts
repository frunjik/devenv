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
