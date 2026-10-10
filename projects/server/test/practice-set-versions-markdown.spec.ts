import { describe, expect, it } from '@jest/globals';

import { renderMarkdown, writeMarkdown } from '../../../scripts/practice-set-versions-markdown';
import { createMemoryTextFileSystem } from '../../shared/src/testing/memory-text-file-system';

// Concise transformed example; values are synthetic and preserve only tested distinctions.
const registryExample = {
    title: 'Practice History',
    scope: 'Project practices only.',
    versioningPolicy: 'Commit changes, then record the commit.',
    latestVersion: 2,
    activeVersion: 2,
    asOf: '2026-01-09T00:00:00Z',
    versions: [
        {
            version: 1,
            summary: 'Testing and modeling used separate helpers.',
            sourceCommit: 'a'.repeat(40),
            activatedAt: '2026-01-01T00:00:00Z',
            deactivatedAt: '2026-01-04T00:00:00Z',
            activationEvidence: 'Started',
            deactivationEvidence: 'Replaced',
        },
        {
            version: 2,
            summary: 'One coordinator uses testing and modeling skills.',
            sourceCommit: 'b'.repeat(40),
            activatedAt: '2026-01-05T00:00:00Z',
            deactivatedAt: null,
            activationEvidence: 'Started',
            deactivationEvidence: null,
        },
    ],
    customizations: [
        {
            kind: 'agent',
            path: '.github/agents/example.agent.md',
            version: 1,
            summary: 'Introduced the example role.',
            sourceCommit: 'c'.repeat(40),
        },
        {
            kind: 'agent',
            path: '.github/agents/example.agent.md',
            version: 2,
            summary: 'Added one review checkpoint.',
            sourceCommit: 'd'.repeat(40),
        },
        {
            kind: 'skill',
            path: '.agents/skills/example/SKILL.md',
            version: 1,
            summary: 'Introduced the example procedure.',
            sourceCommit: 'e'.repeat(40),
        },
    ],
};

describe('practice set version Markdown', () => {
    it('renders a concise illustrative history and computes the active duration', () => {
        const markdown = renderMarkdown(registryExample);

        expect(markdown).toContain('# Practice History');
        expect(markdown).toContain('**Versioning policy:** Commit changes, then record the commit\\.');
        expect(markdown).toContain('npm run generate:practice-set-versions:markdown');
        expect(markdown).toContain('../../scripts/practice-set-versions-markdown.ts');
        expect(markdown).toContain('**Latest recorded version:** **2**');
        expect(markdown).toContain('**Active version:** **2**');
        expect(markdown).toContain('## Version 1');
        expect(markdown).toContain('**Deactivated:** 2026-01-04T00:00:00Z');
        expect(markdown).toContain('## Version 2');
        expect(markdown).toContain('**Used for:** 4 days (2026-01-05T00:00:00Z to 2026-01-09T00:00:00Z)');
        expect(markdown).toContain('**Activation evidence:** Started');
        expect(markdown).toContain('## Agent and skill versions');
        expect(markdown).toContain('### `.github/agents/example.agent.md`');
        expect(markdown).toContain('**Current version:** 2');
        expect(markdown).toContain('- **v1:** Introduced the example role');
        expect(markdown).toContain('- **v2:** Added one review checkpoint');
        expect(markdown).toContain('### `.agents/skills/example/SKILL.md`');
    });

    it('does not claim an in-use duration when dates or activation are unknown', () => {
        const markdown = renderMarkdown({
            ...registryExample,
            activeVersion: null,
            asOf: null,
            versions: registryExample.versions.map((version: object) => ({
                ...version,
                activatedAt: null,
                deactivatedAt: null,
                activationEvidence: null,
                deactivationEvidence: null,
            })),
        });

        expect(markdown).toContain('**Active version:** **Not verified**');
        expect(markdown).toContain('**Used for:** Unknown (activation dates not fully recorded)');
        expect(markdown.match(/\*\*Used for:\*\* Unknown \(activation dates not fully recorded\)/g)).toHaveLength(2);
    });

    it('writes the derived view through the supplied filesystem boundary', () => {
        const io = createMemoryTextFileSystem({ 'input.json': JSON.stringify(registryExample) });

        writeMarkdown('input.json', 'history.md', io);

        expect(io.files.get('history.md')).toContain('# Practice History');
    });

    it.each([
        [{ ...registryExample, latestVersion: 3 }, 'latestVersion must match the highest recorded version'],
        [{ ...registryExample, activeVersion: 3 }, 'activeVersion must reference a recorded version'],
        [{ ...registryExample, asOf: '2026-02-30T00:00:00Z' }, 'asOf must be a valid timestamp or null'],
        [{ ...registryExample, title: '' }, 'title must be non-empty text'],
        [{ ...registryExample, scope: 3 }, 'scope must be non-empty text'],
        [{ ...registryExample, versioningPolicy: '' }, 'versioningPolicy must be non-empty text'],
        [{ ...registryExample, versions: [] }, 'expected a non-empty versions array'],
        [{
            ...registryExample,
            versions: [...registryExample.versions, registryExample.versions[1]],
        }, 'version numbers must be unique'],
        [{
            ...registryExample,
            versions: [{ ...registryExample.versions[0], version: 0 }],
        }, 'version numbers must be unique'],
        [{
            ...registryExample,
            versions: [{ ...registryExample.versions[0], sourceCommit: 'invalid' }],
        }, 'sourceCommit must be a full Git commit hash'],
        [{
            ...registryExample,
            versions: [{
                ...registryExample.versions[1],
                activatedAt: '2026-01-06T00:00:00Z',
                deactivatedAt: '2026-01-05T00:00:00Z',
            }],
        }, 'deactivatedAt must be on or after activatedAt'],
        [{
            ...registryExample,
            versions: [{
                ...registryExample.versions[0],
                activatedAt: null,
                activationEvidence: null,
                deactivatedAt: '2026-01-04T00:00:00Z',
            }],
        }, 'deactivatedAt must be on or after activatedAt'],
        [{
            ...registryExample,
            activeVersion: 1,
        }, 'activeVersion requires an open, dated activation and asOf'],
        [{
            ...registryExample,
            asOf: null,
        }, 'activeVersion requires an open, dated activation and asOf'],
        [{
            ...registryExample,
            asOf: '2026-01-04T00:00:00Z',
        }, 'asOf must be on or after activeVersion activation'],
        [{
            ...registryExample,
            versions: [{
                ...registryExample.versions[1],
                activationEvidence: null,
            }],
        }, 'activatedAt requires activationEvidence'],
        [{
            ...registryExample,
            latestVersion: 1,
            activeVersion: null,
            versions: [{
                ...registryExample.versions[0],
                activatedAt: null,
                deactivatedAt: null,
                activationEvidence: 'Evidence without an activation',
                deactivationEvidence: null,
            }],
        }, 'activationEvidence requires activatedAt'],
        [{
            ...registryExample,
            versions: [{
                ...registryExample.versions[1],
                deactivatedAt: '2026-01-09T00:00:00Z',
                deactivationEvidence: null,
            }],
        }, 'deactivatedAt requires deactivationEvidence'],
        [{
            ...registryExample,
            latestVersion: 1,
            activeVersion: null,
            versions: [{
                ...registryExample.versions[0],
                deactivatedAt: null,
                deactivationEvidence: 'Evidence without a deactivation',
            }],
        }, 'deactivationEvidence requires deactivatedAt'],
        [{
            ...registryExample,
            versions: [{
                ...registryExample.versions[1],
                deactivatedAt: '2026-01-09T00:00:00Z',
                deactivationEvidence: ' ',
            }],
        }, 'deactivationEvidence must be non-empty text'],
        [{ ...registryExample, unexpected: true }, 'expected fields'],
        [{
            ...registryExample,
            customizations: [registryExample.customizations[0], registryExample.customizations[0]],
        }, 'customization versions must be sequential and unique'],
        [{
            ...registryExample,
            customizations: [registryExample.customizations[0], {
                ...registryExample.customizations[1],
                version: 3,
            }],
        }, 'customization versions must be sequential and unique'],
        [{
            ...registryExample,
            customizations: [{
                ...registryExample.customizations[0],
                kind: 'skill',
            }],
        }, 'customization path does not match kind'],
        [{
            ...registryExample,
            customizations: [{
                ...registryExample.customizations[0],
                path: '.github/agents/example.agent.md',
                version: 1,
            }, {
                ...registryExample.customizations[0],
                path: '.github/agents/example.agent.md',
                version: 1,
            }],
        }, 'customization versions must be sequential and unique'],
        [{
            ...registryExample,
            customizations: [{
                ...registryExample.customizations[0],
                sourceCommit: 'invalid',
            }],
        }, 'customization sourceCommit must be a full Git commit hash'],
        [{
            ...registryExample,
            customizations: [{
                ...registryExample.customizations[0],
                summary: ' ',
            }],
        }, 'customization summary must be non-empty text'],
        [{
            ...registryExample,
            customizations: [{
                ...registryExample.customizations[0],
                kind: 'other',
            }],
        }, 'customization kind must be agent or skill'],
        [{
            ...registryExample,
            customizations: [],
        }, 'expected a non-empty customizations array'],
        [{
            ...registryExample,
            customizations: [{
                kind: 'agent',
                path: '.github/agents/example.agent.md',
                version: 0,
                summary: 'Bad version.',
                sourceCommit: 'f'.repeat(40),
            }],
        }, 'customization versions must be positive safe integers'],
    ])('rejects invalid registry data: %s', (invalid: object, message: string) => {
        expect(() => renderMarkdown(invalid)).toThrow(message);
    });

    it('reports unknown duration when a version has no verified end or as-of timestamp', () => {
        const markdown = renderMarkdown({
            ...registryExample,
            activeVersion: null,
            versions: registryExample.versions.map((version: object) => ({
                ...version,
                activatedAt: '2026-01-05T00:00:00Z',
                deactivatedAt: null,
                activationEvidence: 'Started',
                deactivationEvidence: null,
            })),
        });

        expect(markdown).toContain('Unknown (no verified end or as-of timestamp)');
    });

    it('reports duration and evidence for a completed version period', () => {
        const markdown = renderMarkdown({
            ...registryExample,
            versions: registryExample.versions.map((version: { version: number }) => version.version === 1 ? {
                ...version,
                activationEvidence: 'Started',
                deactivationEvidence: 'Replaced',
            } : version),
        });

        expect(markdown).toContain('**Used for:** 3 days (2026-01-01T00:00:00Z to 2026-01-04T00:00:00Z)');
        expect(markdown).toContain('**Deactivation evidence:** Replaced');
    });

    it('propagates read and write errors', () => {
        expect(() => writeMarkdown('input.json', 'history.md', {
            readFileSync: () => '{',
            writeFileSync: () => undefined,
        })).toThrow(SyntaxError);

        expect(() => writeMarkdown('input.json', 'history.md', {
            readFileSync: () => JSON.stringify(registryExample),
            writeFileSync: () => {
                throw new Error('write failed');
            },
        })).toThrow('write failed');
    });
});
