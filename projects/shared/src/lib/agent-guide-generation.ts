import type {
    AgentEssentialsSection, AgentGuidePreview, AgentGuideSources,
    CoordinatorPhase, GeneratedAgentFile,
} from './agent-guide.types';

const phases: CoordinatorPhase[] = ['Understand', 'Explore', 'Make', 'Evaluate'];

function projectLinks(line: string, tddPath: string, entryPath: string): string {
    return line
        .replace(/\.\/agent-essentials-testing\.candidate\.md/g, tddPath)
        .replace(/\.\/agent-essentials\.candidate\.md/g, entryPath);
}

function renderSections(sections: AgentEssentialsSection[], tddPath: string, entryPath: string): string {
    return sections.map(section => [
        `${'#'.repeat(section.level)} ${section.heading}`,
        '',
        ...section.body.map(line => projectLinks(line, tddPath, entryPath)),
    ].join('\n')).join('\n\n');
}

function frontmatter(name: string, description: string): string {
    return `---\nname: ${JSON.stringify(name)}\ndescription: ${JSON.stringify(description)}\n---\n`;
}

function bullets(items: string[]): string {
    return items.map(item => `- ${item}`).join('\n');
}

export function generateAgentGuidePreview(sources: AgentGuideSources): AgentGuidePreview {
    const { phaseSkills: agentPhaseSkills, essentials: agentEssentials, testing: agentEssentialsTesting } = sources;
    const guide = structuredClone(sources.guide);
    const tddPath = '.agents/skills/tdd/SKILL.md';
    const entry = [
        '# Agent Essentials', '',
        'Use the phase skills below when applicable. They guide behavior; these references do not enforce runtime invocation.',
        '',
        ...phases.map(phase => `- [${phase}](.agents/skills/${agentPhaseSkills[phase].name}/SKILL.md)`),
        '- [Agent Phase Guide](.github/agents/agent-phase-guide.agent.md)', '',
        'Project-specific rules, paths and commands live in the [project profile](.github/instructions/project-profile.instructions.md), which applies together with these generic rules.',
        '',
        renderSections(agentEssentials.sections.filter(section => section.heading !== 'Basis and limits'), tddPath, 'AGENTS.md'),
    ].join('\n');
    const coordinator = [
        frontmatter(guide.name, 'Use when coordinating Understand, Explore, Make and Evaluate while retaining task ownership.'),
        `# ${guide.name}`, '', guide.purpose, '',
        '## Responsibilities', '', bullets(guide.coordinatorResponsibilities), '',
        '## Switching policy', '', bullets(guide.switchingPolicy), '',
        '## Work continuity and measurement intent', '',
        guide.workIntent.status, '', guide.workIntent.purpose, '',
        renderSections(
            agentEssentials.sections.filter(section => guide.workIntent.sourceSections.includes(section.heading)),
            '../../.agents/skills/tdd/SKILL.md', '../../AGENTS.md',
        ), '',
        ...phases.map(phase => `- **${phase}:** ${guide.workIntent.phases[phase]}`),
        '', '### Measurement questions', '', bullets(guide.workIntent.measurementQuestions),
        '', bullets(guide.workIntent.boundaries), '',
        ...phases.flatMap(phase => [
            `## ${phase}`, '',
            guide.phases[phase].purpose, '',
            `Load [${phase}](../../.agents/skills/${agentPhaseSkills[phase].name}/SKILL.md) when applicable.`,
            '',
            'Handoff:', bullets(guide.phases[phase].handoff), '',
        ]),
        '## Commit only on request', '', guide.commitProcedure.trigger, '',
        ...guide.commitProcedure.steps.map((step, index) => `${index + 1}. ${step}`),
        '', bullets(guide.commitProcedure.boundaries),
    ].join('\n');
    const files: GeneratedAgentFile[] = [
        { path: 'AGENTS.md', content: `${entry}\n` },
        { path: '.github/agents/agent-phase-guide.agent.md', content: `${coordinator}\n` },
        ...phases.map(phase => {
            const skill = agentPhaseSkills[phase];
            return {
                path: `.agents/skills/${skill.name}/SKILL.md`,
                content: [
                    frontmatter(skill.name, skill.description),
                    `# ${phase}`, '',
                    ...skill.steps.map((step, index) => `${index + 1}. ${step}`),
                    '',
                ].join('\n'),
            };
        }),
        {
            path: tddPath,
            content: [
                frontmatter('tdd', `Use when ${guide.practices.tdd.trigger.charAt(0).toLowerCase()}${guide.practices.tdd.trigger.slice(1)}`),
                '# Test-Driven Development', '',
                'Use for production behavior changes; do not claim TDD for documentation or design alone.', '',
                renderSections(agentEssentialsTesting.sections.filter(section => section.heading !== 'Review boundary'), 'SKILL.md', '../../../AGENTS.md'),
                '',
            ].join('\n'),
        },
    ];
    return {
        guide,
        sourceJson: JSON.stringify({ guide, phaseSkills: agentPhaseSkills }, null, 2),
        files,
        limitations: [
            'Read-only preview: no files are written and no customizations are activated.',
            'Runtime switching, tool restrictions and enable/disable controls are not implemented or verified.',
            'This projection includes selected rules and labelled exploration intents, not historical source documents.',
            'Folder exports include only the six required knowledge JSON/type sources, not the full knowledge history.',
        ],
    };
}
