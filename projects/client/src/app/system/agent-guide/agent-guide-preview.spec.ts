import { describe, expect, it } from '@jest/globals';
import { createAgentGuidePreview } from './agent-guide-preview';
import { agentPhaseSkills } from '../../../../../../knowledge/workflows/agent-phase-guide.types';

describe('agent guide preview', () => {
    it('includes work continuity and measurement intent without adopting the current tracking system', () => {
        const preview = createAgentGuidePreview();
        const agent = preview.files.find(file => file.path.endsWith('.agent.md'))!;
        expect(agent.content).toContain('## Work continuity and measurement intent');
        expect(agent.content).toContain('Resume work');
        expect(agent.content).toContain('5. Trace work to its evaluations');
        expect(agent.content).toContain('6. Capture baseline and completion evidence with little upkeep');
        expect(agent.content).toContain('not selected rules');
        expect(agent.content).toContain('Understand:');
        expect(agent.content).toContain('Evaluate:');
        expect(agent.content).toContain('Goal and success clarity');
        expect(agent.content).toContain('Process overhead');
        expect(agent.content).toContain('Unknown measurements remain unknown');
    });
    it('generates an entry point, coordinator and five skills entirely in memory', () => {
        const preview = createAgentGuidePreview();
        expect(preview.files.map(file => file.path)).toEqual([
            'AGENTS.md',
            '.github/agents/agent-phase-guide.agent.md',
            '.agents/skills/understand/SKILL.md',
            '.agents/skills/explore/SKILL.md',
            '.agents/skills/make/SKILL.md',
            '.agents/skills/evaluate/SKILL.md',
            '.agents/skills/tdd/SKILL.md',
        ]);
        expect(preview.guide.name).toBe('Agent Phase Guide');
        expect(preview.files.every(file => file.content.includes('Preview only'))).toBe(true);
        expect(preview.files[1].content).toContain('An explicit user request to commit');
        expect(preview.files[4].content).toContain('../tdd/SKILL.md');
        expect(preview.files[6].content).toContain('100% statement, branch, function and line coverage');
        expect(preview.files[6].content).toContain('## Red');
        expect(preview.files[6].content).toContain('## Green');
        expect(preview.files[6].content).toContain('## Refactor');
    });

    it('keeps exploration intents distinct and resolves all generated local Markdown links', () => {
        const { files } = createAgentGuidePreview();
        expect(files[0].content).toContain('Intents to explore');
        expect(files[0].content).toContain('not selected rules');
        for (const file of files) {
            for (const match of file.content.matchAll(/\]\(([^)]+)\)/g)) {
                const target = match[1].split('#')[0];
                if (!target) continue;
                const segments = file.path.split('/').slice(0, -1);
                for (const segment of target.split('/')) {
                    if (segment === '..') {
                        expect(segments.length).toBeGreaterThan(0);
                        segments.pop();
                    }
                    else if (segment !== '.') segments.push(segment);
                }
                expect(files.map(item => item.path)).toContain(segments.join('/'));
            }
        }
    });

    it('returns independent previews without modifying source records', () => {
        const first = createAgentGuidePreview();
        first.files[0].content = 'changed locally';
        expect(createAgentGuidePreview().files[0].content).toContain('# Agent Essentials');
    });

    it('preserves skill definitions, valid quoted metadata and all saved steps', () => {
        const { files } = createAgentGuidePreview();
        for (const skill of Object.values(agentPhaseSkills)) {
            const file = files.find(item => item.path === `.agents/skills/${skill.name}/SKILL.md`)!;
            expect(file.content).toContain(`name: ${JSON.stringify(skill.name)}`);
            expect(file.content).toContain(`description: ${JSON.stringify(skill.description)}`);
            for (const step of skill.steps) expect(file.content).toContain(step);
            expect(file.content.startsWith('---\n')).toBe(true);
        }
    });
});
