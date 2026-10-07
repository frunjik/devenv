function escapeText(text) {
    return text.replace(/[\\`*_{}\[\]()#+.!|<>~-]/g, '\\$&').replace(/\r\n?|\n/g, '\n\n');
}

function requireShape(value, fields) {
    if (value === null || typeof value !== 'object'
        || Object.keys(value).sort().join(',') !== [...fields].sort().join(',')) {
        throw new Error(`Invalid MetaExport: expected fields ${fields.join(', ')}`);
    }
}

function requireText(value) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error('Invalid MetaExport: expected non-empty text');
    }
}

function validate(statements) {
    if (!Array.isArray(statements) || statements.length === 0) {
        throw new Error('Invalid MetaExport: expected a non-empty statement array');
    }
    const ids = new Set();
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
        const labels = new Set();
        for (const revision of statement.revisions) {
            requireShape(revision, ['revision', 'assertion', 'context', 'source', 'applicability']);
            if (!Number.isSafeInteger(revision.revision) || revision.revision < 1 || labels.has(revision.revision)) {
                throw new Error('Invalid MetaExport: revision labels must be unique positive safe integers');
            }
            labels.add(revision.revision);
            for (const field of ['assertion', 'context', 'source', 'applicability']) {
                requireText(revision[field]);
            }
        }
    }
}

function writeMarkdown(input, output, filesystem) {
    const statements = JSON.parse(filesystem.readFileSync(input, 'utf8'));
    validate(statements);
    const lines = [
        '# MetaExport: Generated KnowledgeStatements', '',
        'Derived from JSON. All revisions are preserved; inclusion does not imply current applicability or recipient adoption.', '',
    ];
    for (const statement of statements) {
        lines.push(`## ${escapeText(statement.id)}`, '');
        for (const revision of statement.revisions) {
            lines.push(`### Revision ${revision.revision}`, '');
            for (const field of ['assertion', 'context', 'source', 'applicability']) {
                const label = field[0].toUpperCase() + field.slice(1);
                lines.push(`**${label}:** ${escapeText(revision[field])}`, '');
            }
        }
    }
    filesystem.writeFileSync(output, lines.join('\n'), 'utf8');
}

module.exports = { writeMarkdown };
