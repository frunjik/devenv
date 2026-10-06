import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { RequestHandler } from 'express';
import type { SystemPlanConcern, SystemPlanStatus } from '@shared';

const statuses: readonly SystemPlanStatus[] = ['In progress', 'Ready', 'Validated'];

function isSystemPlanStatus(value: string): value is SystemPlanStatus {
    return statuses.some(status => status === value);
}

export function createSystemPlanHandler(root: string): RequestHandler {
    return (_request, response, next) => {
        void readFile(join(root, 'design', 'problem-inquiry-system', 'concerns.md'), 'utf8')
            .then(markdown => response.json({ data: parseSystemPlan(markdown) }))
            .catch(next);
    };
}

function parseSystemPlan(markdown: string): SystemPlanConcern[] {
    const sections = markdown.split(/^### (?=SC-\d{3} — )/m)
        .slice(1)
        .filter(section => !section.startsWith('SC-000 — Short title'));
    if (sections.length === 0) {
        throw new Error('The system concern register contains no concern entries');
    }

    return sections.map(section => {
        const heading = /^(SC-\d{3}) — (.+)\r?\n/.exec(section);
        const metadata = /^\*\*Kind:\*\* (.+?) · \*\*Status:\*\* (.+?) · (?:\*\*Priority:\*\* .+? · )?\*\*Depends on:\*\* (.+)$/m.exec(section);
        if (!heading || !metadata) {
            throw new Error('A system concern is missing its heading or metadata');
        }

        const [, id, title] = heading;
        const [, kind, status, dependencyText] = metadata;
        if (!id || !title || !kind || !isSystemPlanStatus(status)) {
            throw new Error('A system concern has invalid metadata');
        }

        const dependencyMatch = /^(None|SC-\d{3}(?:,\s*SC-\d{3})*)(?:\s+\(.*\))?$/.exec(dependencyText);
        if (!dependencyMatch) {
            throw new Error(`System concern ${id} has invalid dependencies`);
        }
        const dependencies = dependencyMatch[1] === 'None'
            ? []
            : dependencyMatch[1].split(',').map(dependency => dependency.trim());

        const description = section.slice(metadata.index + metadata[0].length).trim();
        const summary = description.split(/\r?\n\s*\r?\n/, 1)[0]?.trim();
        if (!summary) {
            throw new Error(`System concern ${id} has no description`);
        }

        return { id, title, kind, status, dependsOn: dependencies, summary };
    });
}
