import { resolve } from 'node:path';
import { workPlanExportFileSystem, writeWorkPlanMarkdown } from './work-plans-export';

const root = process.cwd();
writeWorkPlanMarkdown(
    resolve(root, 'knowledge/workflows/work-plans.json'),
    resolve(root, 'knowledge/workflows/devenv-value-evaluation.json'),
    resolve(root, 'knowledge/workflows/work-plans.md'),
    workPlanExportFileSystem,
);
