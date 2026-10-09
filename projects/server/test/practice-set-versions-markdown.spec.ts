import { describe, expect, it } from '@jest/globals';

const { renderMarkdown, writeMarkdown } = require('../../../scripts/practice-set-versions-markdown.cjs');

const registry = {
    title: 'Repository Practice Set History',
    scope: 'Repository-controlled development rules and practices only.',
    versioningPolicy: 'Commit practice-set changes first, then add each version in a follow-up commit pinned to the prior practice-change commit.',
    latestVersion: 2,
    activeVersion: 2,
    asOf: '2026-10-09T00:00:00Z',
    versions: [
        {
            version: 1,
            summary: 'TDD and Type Detector were separate agents.',
            sourceCommit: 'bcea50e90ead2f3a02a83dc4be48fe8ea2601ed4',
            activatedAt: null,
            deactivatedAt: null,
            activationEvidence: null,
            deactivationEvidence: null,
        },
        {
            version: 2,
            summary: 'Diligent Coder coordinates TDD and Type Detector skills.',
            sourceCommit: '47fced67cde5b94c813559090dedb4d76c793938',
            activatedAt: '2026-10-01T00:00:00Z',
            deactivatedAt: null,
            activationEvidence: 'Activation confirmed for the test registry',
            deactivationEvidence: null,
        },
    ],
};

describe('practice set version Markdown', () => {
    it('renders the version history and labels unverified activation as unknown', () => {
        const markdown = renderMarkdown(registry);

        expect(markdown).toContain('# Repository Practice Set History');
        expect(markdown).toContain('**Versioning policy:** Commit practice\\-set changes first');
        expect(markdown).toContain('npm run generate:practice-set-versions:markdown');
        expect(markdown).toContain('../../scripts/practice-set-versions-markdown.cjs');
        expect(markdown).toContain('**Latest recorded version:** **2**');
        expect(markdown).toContain('**Active version:** **2**');
        expect(markdown).toContain('## Version 1');
        expect(markdown).toContain('**Activated:** Unknown');
        expect(markdown).toContain('## Version 2');
        expect(markdown).toContain('**Used for:** 8 days (2026-10-01T00:00:00Z to 2026-10-09T00:00:00Z)');
        expect(markdown).toContain('**Activation evidence:** Activation confirmed for the test registry');
    });

    it('does not claim an in-use duration when dates or activation are unknown', () => {
        const markdown = renderMarkdown({
            ...registry,
            activeVersion: null,
            asOf: null,
            versions: registry.versions.map((version: object) => ({
                ...version,
                activatedAt: null,
                activationEvidence: null,
            })),
        });

        expect(markdown).toContain('**Active version:** **Not verified**');
        expect(markdown).toContain('**Used for:** Unknown (activation dates not fully recorded)');
        expect(markdown).not.toContain('Used for: 8 days');
    });

    it('writes the derived view through the supplied filesystem boundary', () => {
        const files = new Map([['registry.json', JSON.stringify(registry)]]);
        const io = {
            readFileSync: (path: string) => files.get(path),
            writeFileSync: (path: string, content: string) => files.set(path, content),
        };

        writeMarkdown('registry.json', 'history.md', io);

        expect(files.get('history.md')).toContain('# Repository Practice Set History');
    });

    it.each([
        [{ ...registry, latestVersion: 3 }, 'latestVersion must match the highest recorded version'],
        [{ ...registry, activeVersion: 3 }, 'activeVersion must reference a recorded version'],
        [{ ...registry, asOf: '2026-02-30T00:00:00Z' }, 'asOf must be a valid timestamp or null'],
        [{ ...registry, title: '' }, 'title must be non-empty text'],
        [{ ...registry, scope: 3 }, 'scope must be non-empty text'],
        [{ ...registry, versioningPolicy: '' }, 'versioningPolicy must be non-empty text'],
        [{ ...registry, versions: [] }, 'expected a non-empty versions array'],
        [{ ...registry, versions: [...registry.versions, registry.versions[1]] }, 'version numbers must be unique'],
        [{ ...registry, versions: [{ ...registry.versions[0], version: 0 }] }, 'version numbers must be unique'],
        [{
            ...registry,
            versions: [{ ...registry.versions[0], sourceCommit: 'invalid' }],
        }, 'sourceCommit must be a full Git commit hash'],
        [{
            ...registry,
            versions: [{
                ...registry.versions[1],
                activatedAt: '2026-10-10T00:00:00Z',
                deactivatedAt: '2026-10-09T00:00:00Z',
            }],
        }, 'deactivatedAt must be on or after activatedAt'],
        [{
            ...registry,
            versions: [{
                ...registry.versions[0],
                deactivatedAt: '2026-10-09T00:00:00Z',
            }],
        }, 'deactivatedAt must be on or after activatedAt'],
        [{
            ...registry,
            activeVersion: 1,
        }, 'activeVersion requires an open, dated activation and asOf'],
        [{
            ...registry,
            asOf: null,
        }, 'activeVersion requires an open, dated activation and asOf'],
        [{
            ...registry,
            asOf: '2026-09-30T00:00:00Z',
        }, 'asOf must be on or after activeVersion activation'],
        [{
            ...registry,
            versions: [{
                ...registry.versions[1],
                activationEvidence: null,
            }],
        }, 'activatedAt requires activationEvidence'],
        [{
            ...registry,
            versions: [{
                ...registry.versions[0],
                activationEvidence: 'Evidence without an activation',
            }],
        }, 'activationEvidence requires activatedAt'],
        [{
            ...registry,
            versions: [{
                ...registry.versions[1],
                deactivatedAt: '2026-10-09T00:00:00Z',
                deactivationEvidence: null,
            }],
        }, 'deactivatedAt requires deactivationEvidence'],
        [{
            ...registry,
            versions: [{
                ...registry.versions[0],
                deactivationEvidence: 'Evidence without a deactivation',
            }],
        }, 'deactivationEvidence requires deactivatedAt'],
        [{
            ...registry,
            versions: [{
                ...registry.versions[1],
                deactivatedAt: '2026-10-09T00:00:00Z',
                deactivationEvidence: ' ',
            }],
        }, 'deactivationEvidence must be non-empty text'],
        [{ ...registry, unexpected: true }, 'expected fields'],
    ])('rejects invalid registry data: %s', (invalid: object, message: string) => {
        expect(() => renderMarkdown(invalid)).toThrow(message);
    });

    it('reports unknown duration when a version has no verified end or as-of timestamp', () => {
        const markdown = renderMarkdown({
            ...registry,
            activeVersion: null,
            versions: registry.versions.map((version: object) => ({
                ...version,
                activatedAt: '2026-10-01T00:00:00Z',
                activationEvidence: 'Activation confirmed for the test registry',
            })),
        });

        expect(markdown).toContain('Unknown (no verified end or as-of timestamp)');
    });

    it('reports duration and evidence for a completed version period', () => {
        const markdown = renderMarkdown({
            ...registry,
            versions: registry.versions.map((version: { version: number }) => version.version === 1 ? {
                ...version,
                activatedAt: '2026-09-01T00:00:00Z',
                activationEvidence: 'Version one activated in the client',
                deactivatedAt: '2026-10-01T00:00:00Z',
                deactivationEvidence: 'Version two replaced it',
            } : version),
        });

        expect(markdown).toContain('**Used for:** 30 days (2026-09-01T00:00:00Z to 2026-10-01T00:00:00Z)');
        expect(markdown).toContain('**Deactivation evidence:** Version two replaced it');
    });

    it('propagates read and write errors', () => {
        expect(() => writeMarkdown('registry.json', 'history.md', {
            readFileSync: () => '{',
            writeFileSync: () => undefined,
        })).toThrow(SyntaxError);

        expect(() => writeMarkdown('registry.json', 'history.md', {
            readFileSync: () => JSON.stringify(registry),
            writeFileSync: () => {
                throw new Error('write failed');
            },
        })).toThrow('write failed');
    });
});
