import type { TextFileSystem } from '../projects/shared/src/lib/text-file-system.types';

export interface MetaExportRevision {
    revision: number;
    assertion: string;
    context: string;
    source: string;
    applicability: string;
}

export interface MetaExportStatement {
    id: string;
    revisions: MetaExportRevision[];
}

const revisionTextFields = ['assertion', 'context', 'source', 'applicability'] as const;

function escapeText(text: string): string {
    return text.replace(/[\\`*_{}\[\]()#+.!|<>~-]/g, '\\$&').replace(/\r\n?|\n/g, '\n\n');
}

function requireShape<Field extends string>(value: unknown, fields: readonly Field[]): asserts value is Record<Field, unknown> {
    if (value === null || typeof value !== 'object'
        || Object.keys(value).sort().join(',') !== [...fields].sort().join(',')) {
        throw new Error(`Invalid MetaExport: expected fields ${fields.join(', ')}`);
    }
}

function requireText(value: unknown): asserts value is string {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error('Invalid MetaExport: expected non-empty text');
    }
}

function validate(statements: unknown): MetaExportStatement[] {
    if (!Array.isArray(statements) || statements.length === 0) {
        throw new Error('Invalid MetaExport: expected a non-empty statement array');
    }
    const ids = new Set<string>();
    const result: MetaExportStatement[] = [];
    for (const statement of statements) {
        requireShape(statement, ['id', 'revisions']);
        requireText(statement.id);
        if (ids.has(statement.id)) {
            throw new Error('Invalid MetaExport: duplicate statement identity');
        }
        ids.add(statement.id);
        if (!Array.isArray(statement.revisions) || statement.revisions.length === 0) {
            throw new Error('Invalid MetaExport: expected preserved revisions');
        }
        const labels = new Set<number>();
        const revisions: MetaExportRevision[] = [];
        for (const revision of statement.revisions) {
            requireShape(revision, ['revision', 'assertion', 'context', 'source', 'applicability']);
            if (typeof revision.revision !== 'number' || !Number.isSafeInteger(revision.revision) || revision.revision < 1 || labels.has(revision.revision)) {
                throw new Error('Invalid MetaExport: revision labels must be unique positive safe integers');
            }
            labels.add(revision.revision);
            requireText(revision.assertion);
            requireText(revision.context);
            requireText(revision.source);
            requireText(revision.applicability);
            revisions.push({
                revision: revision.revision, assertion: revision.assertion, context: revision.context,
                source: revision.source, applicability: revision.applicability,
            });
        }
        result.push({ id: statement.id, revisions });
    }
    return result;
}

export function writeMarkdown(input: string, output: string, filesystem: TextFileSystem): void {
    const source: unknown = JSON.parse(filesystem.readFileSync(input, 'utf8'));
    const statements = validate(source);
    const lines = [
        '# MetaExport: Generated KnowledgeStatements', '',
        'Derived from JSON. All revisions are preserved; inclusion does not imply current applicability or recipient adoption.', '',
    ];
    for (const statement of statements) {
        lines.push(`## ${escapeText(statement.id)}`, '');
        for (const revision of statement.revisions) {
            lines.push(`### Revision ${revision.revision}`, '');
            for (const field of revisionTextFields) {
                const label = field[0].toUpperCase() + field.slice(1);
                lines.push(`**${label}:** ${escapeText(revision[field])}`, '');
            }
        }
    }
    filesystem.writeFileSync(output, lines.join('\n'), 'utf8');
}
