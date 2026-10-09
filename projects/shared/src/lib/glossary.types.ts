export interface GlossaryEntry {
    term: string;
    definitions: string[];
    examples: string[];
    domains: string[];
}

function requireText(value: unknown): asserts value is string {
    if (typeof value !== 'string' || value.trim().length === 0 || /[\r\n]/.test(value)) {
        throw new Error('Invalid Glossary: fields must contain non-empty, single-line text');
    }
}

function requireTextList(value: unknown): asserts value is string[] {
    if (!Array.isArray(value)) {
        throw new Error('Invalid Glossary: definitions, examples, and domains must be arrays');
    }
    for (const item of value) {
        requireText(item);
    }
}

export function validateGlossaryEntries(value: unknown): GlossaryEntry[] {
    if (!Array.isArray(value)) {
        throw new Error('Invalid Glossary: expected an array of entries');
    }
    return value.map(entry => {
        if (entry === null || typeof entry !== 'object'
            || Object.keys(entry).sort().join(',') !== ['definitions', 'domains', 'examples', 'term'].join(',')) {
            throw new Error('Invalid Glossary: expected term, definitions, examples, and domains fields');
        }
        const candidate = entry as Record<string, unknown>;
        requireText(candidate['term']);
        requireTextList(candidate['definitions']);
        requireTextList(candidate['examples']);
        requireTextList(candidate['domains']);
        return {
            term: candidate['term'],
            definitions: candidate['definitions'],
            examples: candidate['examples'],
            domains: candidate['domains'],
        };
    });
}

function escapeMarkdown(text: string): string {
    return text.replace(/[\\`*_{}\[\]()#+.!|<>~-]/g, '\\$&');
}

export function glossaryEntriesToMarkdown(value: unknown): string {
    const entries = validateGlossaryEntries(value);
    const lines = ['# Glossary', ''];
    for (const entry of entries) {
        lines.push(`## ${escapeMarkdown(entry.term)}`, '', '### Definitions', '');
        lines.push(...(entry.definitions.length
            ? entry.definitions.map(definition => `- ${escapeMarkdown(definition)}`)
            : ['_No definitions recorded._']));
        lines.push('', '<details>', '<summary>Examples</summary>', '');
        lines.push(...(entry.examples.length
            ? entry.examples.map(example => `- ${escapeMarkdown(example)}`)
            : ['_No examples recorded._']));
        lines.push('', '</details>', '', '### Domain usage', '');
        lines.push(...(entry.domains.length
            ? entry.domains.map(domain => `- ${escapeMarkdown(domain)}`)
            : ['_Unknown or unrecorded._']));
        lines.push('');
    }
    return lines.join('\n');
}
