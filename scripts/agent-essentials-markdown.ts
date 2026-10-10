import { basename } from 'node:path';
import type { TextFileSystem } from '../projects/shared/src/lib/text-file-system.types';

function requireShape<Field extends string>(value: unknown, fields: Field[]): asserts value is Record<Field, unknown> {
    if (value === null || typeof value !== 'object' || Array.isArray(value)
        || Object.keys(value).sort().join(',') !== [...fields].sort().join(',')) {
        throw new Error('Invalid Agent Essentials: unexpected document fields');
    }
}

function requireLine(value: unknown, nonEmpty = false): asserts value is string {
    if (typeof value !== 'string' || /[\r\n]/.test(value)
        || (nonEmpty && value.trim().length === 0)) {
        throw new Error('Invalid Agent Essentials: expected a Markdown line');
    }
}

function requireLines(value: unknown): asserts value is string[] {
    if (!Array.isArray(value) || value.length === 0) {
        throw new Error('Invalid Agent Essentials: expected non-empty line array');
    }
    for (const line of value) requireLine(line);
}

export function renderMarkdown(document: unknown, sourceName: string): string {
    if (typeof sourceName !== 'string' || !/^[a-z0-9.-]+\.json$/.test(sourceName)) {
        throw new Error('Invalid Agent Essentials: expected a local JSON filename');
    }
    requireShape(document, ['title', 'introduction', 'sections']);
    requireLine(document.title, true);
    requireLines(document.introduction);
    if (!Array.isArray(document.sections) || document.sections.length === 0) {
        throw new Error('Invalid Agent Essentials: expected sections');
    }
    const lines = [
        `# ${document.title}`, '',
        `Generated from [${sourceName}](./${sourceName}). Edit JSON, not this view.`,
        '', ...document.introduction,
    ];
    for (const section of document.sections) {
        requireShape(section, ['level', 'heading', 'body']);
        if (section.level !== 2 && section.level !== 3) {
            throw new Error('Invalid Agent Essentials: expected heading level 2 or 3');
        }
        requireLine(section.heading, true);
        requireLines(section.body);
        lines.push('', `${'#'.repeat(section.level)} ${section.heading}`, '', ...section.body);
    }
    return `${lines.join('\n')}\n`;
}

export function writeMarkdown(input: string, output: string, filesystem: TextFileSystem): void {
    const sourceName = basename(input);
    const document: unknown = JSON.parse(filesystem.readFileSync(input, 'utf8'));
    filesystem.writeFileSync(output, renderMarkdown(document, sourceName), 'utf8');
}
