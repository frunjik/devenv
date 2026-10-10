import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import type { TextFileSystem } from '../projects/shared/src/lib/text-file-system.types';
import { glossaryEntriesToMarkdown, validateGlossaryEntries } from '../projects/shared/src/lib/glossary.types';

export interface AgentPhaseGuideExportFileSystem extends TextFileSystem {
    mkdirSync(path: string, options: { recursive: true }): unknown;
}

export interface AgentPhaseGuideSourceState {
    commit: string;
    /** Repository-relative paths with uncommitted changes, using `/` separators as reported by git. */
    uncommittedPaths: readonly string[];
}

export interface AgentPhaseGuideExportManifest {
    name: 'agent-phase-guide';
    commit: string;
    files: string[];
}

export const agentPhaseGuideCoreFiles: readonly string[] = [
    'AGENTS.md',
    '.github/agents/agent-phase-guide.agent.md',
    ...['understand', 'explore', 'make', 'evaluate', 'tdd', 'ui-design-review']
        .map(skill => `.agents/skills/${skill}/SKILL.md`),
];
export const projectProfileTemplatePath = 'knowledge/practices/project-profile.template.md';
export const projectProfilePath = '.github/instructions/project-profile.instructions.md';
const manifestPath = 'agent-phase-guide.manifest.json';

export function exportAgentPhaseGuide(
    sourceRoot: string,
    destination: string,
    source: AgentPhaseGuideSourceState,
    fileSystem: AgentPhaseGuideExportFileSystem,
): AgentPhaseGuideExportManifest {
    if (!/^[0-9a-f]{40}$/.test(source.commit)) {
        throw new Error(`Expected a full commit hash, got '${source.commit}'.`);
    }
    // relative() yields '..' segments for siblings/parents and an absolute path for another Windows drive; both are outside.
    if (!/^(\.\.([\\/]|$)|[a-zA-Z]:|[\\/])/.test(relative(sourceRoot, destination))) {
        throw new Error('The export destination must be outside the source folder.');
    }
    const copies = [
        ...agentPhaseGuideCoreFiles.map(path => ({ from: path, to: path })),
        { from: projectProfileTemplatePath, to: projectProfilePath },
    ];
    const uncommitted = [...copies.map(copy => copy.from), '.glossary.json']
        .filter(path => source.uncommittedPaths.includes(path));
    if (uncommitted.length > 0) {
        throw new Error(`Uncommitted AgentPhaseGuide sources: ${uncommitted.join(', ')}. Commit them so the manifest pins the exported content.`);
    }
    // Read everything before writing so a missing source cannot leave a partial export behind.
    const contents = copies.map(copy => ({ ...copy, content: fileSystem.readFileSync(join(sourceRoot, copy.from), 'utf8') }));
    const glossarySource: unknown = JSON.parse(fileSystem.readFileSync(join(sourceRoot, '.glossary.json'), 'utf8'));
    const glossary = validateGlossaryEntries(glossarySource).filter(entry => entry.domains.includes('AgentPhaseGuide'));
    if (glossary.length === 0) {
        throw new Error('No AgentPhaseGuide glossary entries found in .glossary.json.');
    }
    // Derive both views from the main glossary instead of maintaining a second set of definitions.
    const outputs = [
        ...contents,
        { to: '.glossary.json', content: `${JSON.stringify(glossary, null, 2)}\n` },
        { to: '.glossary', content: glossaryEntriesToMarkdown(glossary) },
    ];
    for (const { to, content } of outputs) {
        const target = join(destination, to);
        fileSystem.mkdirSync(dirname(target), { recursive: true });
        fileSystem.writeFileSync(target, content, 'utf8');
    }
    const manifest: AgentPhaseGuideExportManifest = {
        name: 'agent-phase-guide',
        commit: source.commit,
        files: outputs.map(output => output.to),
    };
    fileSystem.writeFileSync(join(destination, manifestPath), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    return manifest;
}

export const agentPhaseGuideExportFileSystem: AgentPhaseGuideExportFileSystem = {
    readFileSync,
    writeFileSync,
    mkdirSync,
};
