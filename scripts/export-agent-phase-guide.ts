import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { agentPhaseGuideExportFileSystem, exportAgentPhaseGuide } from './agent-phase-guide-export';

const destinationArgument = process.argv[2] ?? resolve('..', 'devenv-agent-guide');
const git = (...args: string[]) => execFileSync('git', args, { encoding: 'utf8' });
const lines = (output: string) => output.split('\n').map(line => line.trim()).filter(Boolean);
const root = process.cwd();
const destination = resolve(root, destinationArgument);
const commit = git('rev-parse', 'HEAD').trim();
const manifest = exportAgentPhaseGuide(root, destination, {
    commit,
    uncommittedPaths: [
        ...lines(git('diff', '--name-only', 'HEAD')),
        ...lines(git('ls-files', '--others', '--exclude-standard')),
    ],
}, agentPhaseGuideExportFileSystem);
console.log(`Exported ${manifest.files.length} AgentPhaseGuide files at ${commit} to ${destination}`);
