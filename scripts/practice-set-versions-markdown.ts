import type { PracticeSetVersion, PracticeCustomizationVersion } from '../knowledge/practices/practice-set-versions.types';
import type { TextFileSystem } from '../projects/shared/src/lib/text-file-system.types';

interface PracticeSetRegistry {
    title: string;
    scope: string;
    versioningPolicy: string;
    latestVersion: number;
    activeVersion: number | null;
    asOf: string | null;
    versions: PracticeSetVersion[];
    customizations: PracticeCustomizationVersion[];
}

function requireShape<Field extends string>(value: unknown, fields: Field[]): asserts value is Record<Field, unknown> {
    if (value === null || typeof value !== 'object' || Array.isArray(value)
        || Object.keys(value).sort().join(',') !== [...fields].sort().join(',')) {
        throw new Error(`Invalid practice-set registry: expected fields ${fields.join(', ')}`);
    }
}

function requireText(value: unknown, field: string): asserts value is string {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`Invalid practice-set registry: ${field} must be non-empty text`);
    }
}

function isTimestamp(value: unknown): value is string {
    return typeof value === 'string'
        && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)
        && !Number.isNaN(Date.parse(value))
        && new Date(value).toISOString().replace(/\.000Z$/, 'Z') === value;
}

function requireTimestamp(value: unknown, field: string): asserts value is string | null {
    if (value !== null && !isTimestamp(value)) {
        throw new Error(`Invalid practice-set registry: ${field} must be a valid timestamp or null`);
    }
}

function validateCustomizations(customizations: unknown): PracticeCustomizationVersion[] {
    if (!Array.isArray(customizations) || customizations.length === 0) {
        throw new Error('Invalid practice-set registry: expected a non-empty customizations array');
    }

    const latestByPath = new Map<string, number>();
    const result: PracticeCustomizationVersion[] = [];
    for (const customization of customizations) {
        requireShape(customization, ['kind', 'path', 'version', 'summary', 'sourceCommit']);
        if (customization.kind !== 'agent' && customization.kind !== 'skill') {
            throw new Error('Invalid practice-set registry: customization kind must be agent or skill');
        }
        requireText(customization.path, 'customization path');
        const expectedPath = customization.kind === 'agent'
            ? /^\.github\/agents\/[^/]+\.agent\.md$/
            : /^\.agents\/skills\/[^/]+\/SKILL\.md$/;
        if (!expectedPath.test(customization.path)) {
            throw new Error('Invalid practice-set registry: customization path does not match kind');
        }
        if (typeof customization.version !== 'number' || !Number.isSafeInteger(customization.version) || customization.version < 1) {
            throw new Error('Invalid practice-set registry: customization versions must be positive safe integers');
        }
        requireText(customization.summary, 'customization summary');
        if (typeof customization.sourceCommit !== 'string' || !/^[a-f0-9]{40}$/.test(customization.sourceCommit)) {
            throw new Error('Invalid practice-set registry: customization sourceCommit must be a full Git commit hash');
        }

        const previousVersion = latestByPath.get(customization.path);
        const expectedVersion = previousVersion ? previousVersion + 1 : 1;
        if (customization.version !== expectedVersion) {
            throw new Error('Invalid practice-set registry: customization versions must be sequential and unique');
        }
        latestByPath.set(customization.path, customization.version);
        result.push({
            kind: customization.kind, path: customization.path, version: customization.version,
            summary: customization.summary, sourceCommit: customization.sourceCommit,
        });
    }
    return result;
}

function validate(registry: unknown): PracticeSetRegistry {
    requireShape(registry, [
        'title', 'scope', 'versioningPolicy', 'latestVersion', 'activeVersion', 'asOf', 'versions',
        'customizations',
    ]);
    requireText(registry.title, 'title');
    requireText(registry.scope, 'scope');
    requireText(registry.versioningPolicy, 'versioningPolicy');
    requireTimestamp(registry.asOf, 'asOf');
    if (!Array.isArray(registry.versions) || registry.versions.length === 0) {
        throw new Error('Invalid practice-set registry: expected a non-empty versions array');
    }
    const customizations = validateCustomizations(registry.customizations);

    const versions = new Set<number>();
    const entries: PracticeSetVersion[] = [];
    let highestVersion = 0;
    for (const entry of registry.versions) {
        requireShape(entry, [
            'version', 'summary', 'sourceCommit', 'activatedAt', 'deactivatedAt',
            'activationEvidence', 'deactivationEvidence',
        ]);
        if (typeof entry.version !== 'number' || !Number.isSafeInteger(entry.version) || entry.version < 1 || versions.has(entry.version)) {
            throw new Error('Invalid practice-set registry: version numbers must be unique positive integers');
        }
        versions.add(entry.version);
        highestVersion = Math.max(highestVersion, entry.version);
        requireText(entry.summary, 'summary');
        if (typeof entry.sourceCommit !== 'string' || !/^[a-f0-9]{40}$/.test(entry.sourceCommit)) {
            throw new Error('Invalid practice-set registry: sourceCommit must be a full Git commit hash');
        }
        requireTimestamp(entry.activatedAt, 'activatedAt');
        requireTimestamp(entry.deactivatedAt, 'deactivatedAt');
        if (entry.deactivatedAt !== null
            && (entry.activatedAt === null || Date.parse(entry.deactivatedAt) < Date.parse(entry.activatedAt))) {
            throw new Error('Invalid practice-set registry: deactivatedAt must be on or after activatedAt');
        }
        if (entry.activatedAt !== null && entry.activationEvidence === null) {
            throw new Error('Invalid practice-set registry: activatedAt requires activationEvidence');
        }
        if (entry.activatedAt === null && entry.activationEvidence !== null) {
            throw new Error('Invalid practice-set registry: activationEvidence requires activatedAt');
        }
        if (entry.activationEvidence !== null) {
            requireText(entry.activationEvidence, 'activationEvidence');
        }
        if (entry.deactivatedAt !== null && entry.deactivationEvidence === null) {
            throw new Error('Invalid practice-set registry: deactivatedAt requires deactivationEvidence');
        }
        if (entry.deactivatedAt === null && entry.deactivationEvidence !== null) {
            throw new Error('Invalid practice-set registry: deactivationEvidence requires deactivatedAt');
        }
        if (entry.deactivationEvidence !== null) {
            requireText(entry.deactivationEvidence, 'deactivationEvidence');
        }
        entries.push({
            version: entry.version, summary: entry.summary, sourceCommit: entry.sourceCommit,
            activatedAt: entry.activatedAt, deactivatedAt: entry.deactivatedAt,
            activationEvidence: entry.activationEvidence, deactivationEvidence: entry.deactivationEvidence,
        });
    }

    if (registry.latestVersion !== highestVersion) {
        throw new Error('Invalid practice-set registry: latestVersion must match the highest recorded version');
    }
    if (registry.activeVersion !== null && (typeof registry.activeVersion !== 'number' || !versions.has(registry.activeVersion))) {
        throw new Error('Invalid practice-set registry: activeVersion must reference a recorded version');
    }
    if (registry.activeVersion !== null) {
        // Membership was checked above, so the corresponding validated entry is present.
        const active = entries.find((entry) => entry.version === registry.activeVersion)!;
        if (active.activatedAt === null || active.deactivatedAt !== null || registry.asOf === null) {
            throw new Error('Invalid practice-set registry: activeVersion requires an open, dated activation and asOf');
        }
        if (Date.parse(registry.asOf) < Date.parse(active.activatedAt)) {
            throw new Error('Invalid practice-set registry: asOf must be on or after activeVersion activation');
        }
    }
    return {
        title: registry.title, scope: registry.scope, versioningPolicy: registry.versioningPolicy,
        latestVersion: highestVersion, activeVersion: registry.activeVersion,
        asOf: registry.asOf, versions: entries, customizations,
    };
}

function escapeText(value: string): string {
    return value.replace(/[\\`*_{}\[\]()#+.!|<>~-]/g, '\\$&').replace(/\r\n?|\n/g, ' ');
}

function elapsedDays(start: string, end: string): number {
    return Math.floor((Date.parse(end) - Date.parse(start)) / 86_400_000);
}

function duration(entry: PracticeSetVersion, registry: PracticeSetRegistry): string {
    if (entry.activatedAt === null) {
        return 'Unknown (activation dates not fully recorded)';
    }
    const end = entry.deactivatedAt || (registry.activeVersion === entry.version ? registry.asOf : null);
    if (end === null) {
        return 'Unknown (no verified end or as-of timestamp)';
    }
    return `${elapsedDays(entry.activatedAt, end)} days (${entry.activatedAt} to ${end})`;
}

export function renderMarkdown(value: unknown): string {
    const registry = validate(value);
    const lines = [
        `# ${escapeText(registry.title)}`,
        '',
        'Generated from [practice-set-versions.json](./practice-set-versions.json). Edit JSON, not this view.',
        'Regenerate with `npm run generate:practice-set-versions:markdown` using [the registry renderer](../../scripts/practice-set-versions-markdown.ts).',
        '',
        `**Scope:** ${escapeText(registry.scope)}`,
        '',
        `**Versioning policy:** ${escapeText(registry.versioningPolicy)}`,
        '',
        `**Latest recorded version:** **${registry.latestVersion}**`,
        `**Active version:** **${registry.activeVersion === null ? 'Not verified' : registry.activeVersion}**`,
        `**Duration calculation as of:** ${registry.asOf || 'Not recorded'}`,
        '',
        'Activation dates are recorded only when verified; Git commit dates do not establish when a version entered use.',
    ];
    for (const entry of registry.versions) {
        lines.push(
            '',
            `## Version ${entry.version}`,
            '',
            `**Changes:** ${escapeText(entry.summary)}`,
            `**Source commit:** \`${entry.sourceCommit}\``,
            `**Activated:** ${entry.activatedAt || 'Unknown'}`,
            `**Deactivated:** ${entry.deactivatedAt || 'Unknown / not recorded'}`,
            `**Used for:** ${duration(entry, registry)}`,
            `**Activation evidence:** ${entry.activationEvidence ? escapeText(entry.activationEvidence) : 'Not recorded'}`,
            `**Deactivation evidence:** ${entry.deactivationEvidence ? escapeText(entry.deactivationEvidence) : 'Not recorded'}`,
        );
    }
    lines.push('', '## Agent and skill versions');
    const customizationsByPath = new Map<string, PracticeCustomizationVersion[]>();
    for (const customization of registry.customizations) {
        const versions = customizationsByPath.get(customization.path);
        if (versions) {
            versions.push(customization);
        } else {
            customizationsByPath.set(customization.path, [customization]);
        }
    }
    for (const [path, versions] of customizationsByPath) {
        lines.push(
            '',
            `### \`${path}\``,
            '',
            `**Kind:** ${versions[0].kind}`,
            `**Current version:** ${versions[versions.length - 1].version}`,
        );
        for (const version of versions) {
            lines.push(
                `- **v${version.version}:** ${escapeText(version.summary)} (source commit: \`${version.sourceCommit}\`)`,
            );
        }
    }
    return `${lines.join('\n')}\n`;
}

export function writeMarkdown(input: string, output: string, filesystem: TextFileSystem): void {
    const registry: unknown = JSON.parse(filesystem.readFileSync(input, 'utf8'));
    const markdown = renderMarkdown(registry);
    filesystem.writeFileSync(output, markdown, 'utf8');
}
