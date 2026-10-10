import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { join, resolve } from 'node:path';
import { createMemoryTextFileSystem } from '../../shared/src/testing/memory-text-file-system';
import { guidePackageFiles } from '../../../.agents/guide-package/clone-guide';

describe('portable clone entry', () => {
    const argv = process.argv;
    afterEach(() => {
        process.argv = argv;
        jest.dontMock('node:fs');
        jest.restoreAllMocks();
    });

    it('runs the real clone with current-directory source and the destination argument', () => {
        const root = process.cwd();
        const target = resolve('..', 'entry-clone');
        const io = createMemoryTextFileSystem(Object.fromEntries([
            ...guidePackageFiles.map(file => [join(root, file), `current ${file}`]),
            [join(root, 'agent-phase-guide.manifest.json'), JSON.stringify({
                name: 'agent-phase-guide', commit: 'a'.repeat(40), files: guidePackageFiles,
            })],
        ]));
        // The entry runs on import: intercept filesystem boundaries while retaining actual cloning behavior.
        jest.doMock('node:fs', () => ({
            ...io, realpathSync: (path: string) => path, mkdirSync: () => undefined,
        }));
        const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
        process.argv = ['node', 'clone.ts', target];
        jest.isolateModules(() => require('../../../.agents/guide-package/clone'));
        expect(io.readFileSync(join(target, 'package.json'), 'utf8')).toBe('current package.json');
        expect(log).toHaveBeenCalledWith(`Cloned AgentPhaseGuide to ${target}`);
    });

    it('requires a destination', () => {
        process.argv = ['node', 'clone.ts'];
        expect(() => jest.isolateModules(() => require('../../../.agents/guide-package/clone')))
            .toThrow('Usage: npm run clone -- <destination>');
    });
});
