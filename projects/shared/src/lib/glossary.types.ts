export interface GlossaryEntry {
    term: string;
    definitions: string[];
    examples: string[];
    domains: string[];
}

const DEFINITION_MARKER = '- ';
const EXAMPLE_MARKER = 'Example: ';
const DOMAINS_MARKER = 'Domains:';

export function parseGlossaryLines(lines: readonly string[]): GlossaryEntry[] {
    const entries: GlossaryEntry[] = [];
    for (const sourceLine of lines) {
        const line = sourceLine.trim();
        if (!line) {
            continue;
        }
        const current = entries.at(-1);
        if (line.startsWith(DEFINITION_MARKER) && current) {
            const text = line.slice(DEFINITION_MARKER.length).trim();
            if (text.startsWith(EXAMPLE_MARKER)) {
                current.examples.push(text.slice(EXAMPLE_MARKER.length).trim());
            } else if (text.startsWith(DOMAINS_MARKER)) {
                const domains = text.slice(DOMAINS_MARKER.length).split(',').map(domain => domain.trim());
                if (domains.some(domain => domain.length === 0)) {
                    throw new Error('Usage Domains must contain non-empty labels');
                }
                current.domains.push(...domains);
            } else {
                current.definitions.push(text);
            }
        } else {
            entries.push({ term: line, definitions: [], examples: [], domains: [] });
        }
    }
    return entries;
}
