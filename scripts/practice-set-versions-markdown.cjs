function requireShape(value, fields) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)
        || Object.keys(value).sort().join(',') !== [...fields].sort().join(',')) {
        throw new Error(`Invalid practice-set registry: expected fields ${fields.join(', ')}`);
    }
}

function requireText(value, field) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`Invalid practice-set registry: ${field} must be non-empty text`);
    }
}

function isTimestamp(value) {
    return typeof value === 'string'
        && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)
        && !Number.isNaN(Date.parse(value))
        && new Date(value).toISOString().replace(/\.000Z$/, 'Z') === value;
}

function requireTimestamp(value, field) {
    if (value !== null && !isTimestamp(value)) {
        throw new Error(`Invalid practice-set registry: ${field} must be a valid timestamp or null`);
    }
}

function validateCustomizations(customizations) {
    if (!Array.isArray(customizations) || customizations.length === 0) {
        throw new Error('Invalid practice-set registry: expected a non-empty customizations array');
    }

    const latestByPath = new Map();
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
        if (!Number.isSafeInteger(customization.version) || customization.version < 1) {
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
    }
}

function validate(registry) {
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
    validateCustomizations(registry.customizations);

    const versions = new Set();
    let highestVersion = 0;
    for (const entry of registry.versions) {
        requireShape(entry, [
            'version', 'summary', 'sourceCommit', 'activatedAt', 'deactivatedAt',
            'activationEvidence', 'deactivationEvidence',
        ]);
        if (!Number.isSafeInteger(entry.version) || entry.version < 1 || versions.has(entry.version)) {
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
    }

    if (registry.latestVersion !== highestVersion) {
        throw new Error('Invalid practice-set registry: latestVersion must match the highest recorded version');
    }
    if (registry.activeVersion !== null && !versions.has(registry.activeVersion)) {
        throw new Error('Invalid practice-set registry: activeVersion must reference a recorded version');
    }
    if (registry.activeVersion !== null) {
        const active = registry.versions.find((entry) => entry.version === registry.activeVersion);
        if (active.activatedAt === null || active.deactivatedAt !== null || registry.asOf === null) {
            throw new Error('Invalid practice-set registry: activeVersion requires an open, dated activation and asOf');
        }
        if (Date.parse(registry.asOf) < Date.parse(active.activatedAt)) {
            throw new Error('Invalid practice-set registry: asOf must be on or after activeVersion activation');
        }
    }
}

function escapeText(value) {
    return value.replace(/[\\`*_{}\[\]()#+.!|<>~-]/g, '\\$&').replace(/\r\n?|\n/g, ' ');
}

function elapsedDays(start, end) {
    return Math.floor((Date.parse(end) - Date.parse(start)) / 86_400_000);
}

function duration(entry, registry) {
    if (entry.activatedAt === null) {
        return 'Unknown (activation dates not fully recorded)';
    }
    const end = entry.deactivatedAt || (registry.activeVersion === entry.version ? registry.asOf : null);
    if (end === null) {
        return 'Unknown (no verified end or as-of timestamp)';
    }
    return `${elapsedDays(entry.activatedAt, end)} days (${entry.activatedAt} to ${end})`;
}

function renderMarkdown(registry) {
    validate(registry);
    const lines = [
        `# ${escapeText(registry.title)}`,
        '',
        'Generated from [practice-set-versions.json](./practice-set-versions.json). Edit JSON, not this view.',
        'Regenerate with `npm run generate:practice-set-versions:markdown` using [the registry renderer](../../scripts/practice-set-versions-markdown.cjs).',
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
    const customizationsByPath = new Map();
    for (const customization of registry.customizations) {
        if (!customizationsByPath.has(customization.path)) {
            customizationsByPath.set(customization.path, []);
        }
        customizationsByPath.get(customization.path).push(customization);
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

function writeMarkdown(input, output, filesystem) {
    const registry = JSON.parse(filesystem.readFileSync(input, 'utf8'));
    const markdown = renderMarkdown(registry);
    filesystem.writeFileSync(output, markdown, 'utf8');
}

module.exports = { renderMarkdown, writeMarkdown };
