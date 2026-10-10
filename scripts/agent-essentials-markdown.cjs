function requireShape(value, fields) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)
        || Object.keys(value).sort().join(',') !== [...fields].sort().join(',')) {
        throw new Error('Invalid Agent Essentials: unexpected document fields');
    }
}

function requireLine(value, nonEmpty = false) {
    if (typeof value !== 'string' || /[\r\n]/.test(value)
        || (nonEmpty && value.trim().length === 0)) {
        throw new Error('Invalid Agent Essentials: expected a Markdown line');
    }
}

function requireLines(value) {
    if (!Array.isArray(value) || value.length === 0) {
        throw new Error('Invalid Agent Essentials: expected non-empty line array');
    }
    for (const line of value) requireLine(line);
}

function renderMarkdown(document, sourceName) {
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

function writeMarkdown(input, output, filesystem) {
    const sourceName = require('node:path').basename(input);
    const document = JSON.parse(filesystem.readFileSync(input, 'utf8'));
    filesystem.writeFileSync(output, renderMarkdown(document, sourceName), 'utf8');
}

module.exports = { renderMarkdown, writeMarkdown };
