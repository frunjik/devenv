import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { createWorkEffortReport, workEffortReportSlicesToMarkdown, workEffortReportSummaryToMarkdown, workEffortReportToMarkdown } from './work-effort-report';

const args = process.argv.slice(2);
if (args.length > 1 || (args.length === 1 && args[0] !== '--slices')) {
    throw new Error('Usage: generate-work-effort-report.ts [--slices]');
}
const showSlices = args[0] === '--slices';
const root = process.cwd();
const sourcePaths = [
    'knowledge/workflows/devenv-value-evaluation.json',
    'knowledge/workflows/work-effort-classifications.json',
    'knowledge/workflows/workflow-todo-list.json',
    'knowledge/workflows/work-plans.json',
];
const sources = sourcePaths.map(path => {
    const text = readFileSync(resolve(root, path), 'utf8');
    const value: unknown = JSON.parse(text);
    return { path, value, sha256: createHash('sha256').update(text).digest('hex') };
});
const git = (...args: string[]) => execFileSync('git', args, { encoding: 'utf8' });
const report = createWorkEffortReport(
    sources[0].value, sources[1].value,
    git('log', '--format=%H%x09%aI%x09%cI%x09%s', 'HEAD'),
);
const workflowTimingEvidence = git('ls-files', 'knowledge/workflows/*.md').split('\n')
    .filter(path => path.length > 0 && !path.endsWith('work-effort-report.generated.md'))
    .map(path => {
        const text = readFileSync(resolve(root, path), 'utf8');
        return {
            path, sha256: createHash('sha256').update(text).digest('hex'),
            statements: text.split(/\r?\n/).map((text, index) => ({ line: index + 1, text }))
                .filter(statement => /elapsed|wall.clock|active effort|completed at|completion at|started at|start at|\d{2}:\d{2}/i.test(statement.text)),
        };
    });
const limitations = [
    'Scope is all reachable HEAD history and current repository records, not deleted branches, inaccessible chats or all work ever done.',
    'Cloud and local session-history discovery returned no rows for 7-day and 365-day queries during this analysis. Session/tool usage, costs, waiting and active human effort are unavailable, not zero.',
    'The current conversation confirms timestamped agent-rule, glossary and export work after the last completed evaluation, but a reliable task interval allocation is unavailable. It is not added to duration totals.',
    'All original delivery-flow/overhead measure text is retained in the evaluation rows; elapsed time is computed from timestamps, not extracted from prose.',
    'Long canvas and diagram windows explicitly include pauses and intervening work; their category is an outcome classification, not proof of exclusive activity.',
    'Older commits are inventoried but not classified from subjects alone. No duration or active effort is inferred from commit dates, counts or gaps.',
    'Workflow checkpoint statements may repeat ledger evidence. They corroborate intervals and preserve follow-ups, but are not added as independent durations.',
    'Existing workflow Product work labels need not equal Problem/Domain under the agreed outcome-based definition; originals are retained for review.',
    'Source hashes identify exact working-copy evidence, including uncommitted task state. sourceCommit identifies the Git inventory, not a claim that all source snapshots were committed there.',
    'Classification judgments are explicit and revisable. No time split is inferred for Mixed outcomes or cross-category overlaps.',
    'Incomplete or absent evaluation intervals remain unknown; elapsed union coverage is not evidence coverage for the full calendar period.',
];
const snapshot = {
    ...report,
    generatedAt: new Date().toISOString(),
    sourceCommit: git('rev-parse', 'HEAD').trim(),
    sourceHashes: sources.map(({ path, sha256 }) => ({ path, sha256 })),
    workflowRegistrySnapshot: sources[2].value,
    workPlanRegistrySnapshot: sources[3].value,
    workflowTimingEvidence,
    limitations,
};
const evidenceMarkdown = [
    '## Scope, sources and limitations', '',
    `Git inventory pinned to ${snapshot.sourceCommit}. Snapshot generated at ${snapshot.generatedAt}.`,
    'Classification source: [reviewed outcome classifications](./work-effort-classifications.json).',
    'Exact source hashes, original workflow/WorkPlan records, and extracted checkpoint evidence are retained in [the JSON snapshot](./work-effort-report.json).',
    ...limitations.map(line => `- ${line}`), '',
    '## Workflow checkpoint timing statements', '',
    'These are corroborating records, not additional durations.',
    ...workflowTimingEvidence.flatMap(file => [
        `### [${file.path}](../../${file.path})`, '',
        ...file.statements.map(statement => `- Line ${statement.line}: ${statement.text}`), '',
    ]),
].join('\n');
writeFileSync(resolve(root, 'knowledge/workflows/work-effort-report.json'), `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
writeFileSync(resolve(root, 'knowledge/workflows/work-effort-report.generated.md'), `${workEffortReportToMarkdown(report)}\n${evidenceMarkdown}\n`, 'utf8');
console.log(`Generated report: ${report.rows.length} evaluations, ${report.commits.length} commits, ${workflowTimingEvidence.length} workflow documents.`);
console.log(`\n${showSlices ? workEffortReportSlicesToMarkdown(report, sources[3].value) : workEffortReportSummaryToMarkdown(report)}`);
