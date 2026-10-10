import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

export interface GuideCloneFileSystem {
    readFileSync(path: string, encoding: 'utf8'): string;
    writeFileSync(path: string, content: string, encoding: 'utf8'): void;
    realpathSync(path: string): string;
    mkdirSync(path: string, options?: { recursive: true }): unknown;
}

export const guideCoreFiles: readonly string[] = [
    'AGENTS.md',
    '.github/agents/agent-phase-guide.agent.md',
    ...['understand', 'explore', 'make', 'evaluate', 'tdd', 'ui-design-review']
        .map(skill => `.agents/skills/${skill}/SKILL.md`),
];

export const guidePackageFiles: readonly string[] = [
    ...guideCoreFiles,
    '.github/instructions/project-profile.instructions.md',
    'README.md',
    'package.json',
    'scripts/clone-guide.ts',
    'scripts/clone.ts',
    '.glossary.json',
    '.glossary',
];

interface GuideManifest {
    name: 'agent-phase-guide';
    commit: string;
    files: string[];
}

function validateManifest(value: unknown): GuideManifest {
    if (value === null || typeof value !== 'object') throw new Error('Invalid Guide manifest');
    const candidate = value as Record<string, unknown>;
    const files = candidate['files'];
    if (Object.keys(candidate).sort().join(',') !== 'commit,files,name'
        || candidate['name'] !== 'agent-phase-guide'
        || typeof candidate['commit'] !== 'string' || !/^[a-f0-9]{40}$/.test(candidate['commit'])
        || !Array.isArray(files)
        || files.length !== guidePackageFiles.length
        || !guidePackageFiles.every(file => files.includes(file))) {
        throw new Error('Invalid Guide manifest: expected the complete Guide file list and origin commit');
    }
    return { name: 'agent-phase-guide', commit: candidate['commit'], files: [...guidePackageFiles] };
}

function contains(parent: string, child: string): boolean {
    const path = relative(parent, child);
    return path === '' || (!isAbsolute(path) && path !== '..' && !path.startsWith(`..${sep}`));
}

export function cloneAgentGuide(sourceRoot: string, destination: string, filesystem: GuideCloneFileSystem): void {
    const root = filesystem.realpathSync(resolve(sourceRoot));
    const target = join(filesystem.realpathSync(dirname(resolve(destination))), basename(resolve(destination)));
    if (contains(root, target) || contains(target, root)) {
        throw new Error('Guide source and destination must not overlap.');
    }
    const manifest: unknown = JSON.parse(filesystem.readFileSync(join(root, 'agent-phase-guide.manifest.json'), 'utf8'));
    validateManifest(manifest);
    // Read the complete curated package before creating a destination; never follow arbitrary manifest paths.
    const contents = guidePackageFiles.map(file => ({
        file, content: filesystem.readFileSync(join(root, file), 'utf8'),
    }));
    filesystem.mkdirSync(target);
    for (const { file, content } of contents) {
        const output = join(target, file);
        filesystem.mkdirSync(dirname(output), { recursive: true });
        filesystem.writeFileSync(output, content, 'utf8');
    }
    // Keep the original export record: its commit is provenance, not a claim that local edits were committed there.
    filesystem.writeFileSync(join(target, 'agent-phase-guide.manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}
