import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { dirname, join, resolve } from 'node:path';
import {
    cloneDevEnv,
    type DevEnvCloneFileSystem,
} from '../src/lib/handlers/devenv-clone';

describe('DevEnv clone package', () => {
    const root = resolve('source');
    const destination = join(dirname(root), 'devenv-export-test');
    const stage = join(dirname(destination), '.devenv-clone-test');
    let fileSystem: jest.Mocked<DevEnvCloneFileSystem>;

    beforeEach(() => {
        fileSystem = {
            realpath: jest.fn(async path => path),
            lstat: jest.fn(async () => {
                throw Object.assign(new Error('Not found'), { code: 'ENOENT' });
            }),
            mkdtemp: jest.fn(async () => stage),
            cp: jest.fn(async () => undefined),
            rename: jest.fn(async () => undefined),
            rm: jest.fn(async () => undefined),
        };
    });

    it('copies the curated resources while excluding workspace state and generated content', async () => {
        const result = await cloneDevEnv(root, { destination, replaceExisting: true }, fileSystem);

        expect(result).toEqual({ destination, replacedExisting: false });
        const copiedPaths = fileSystem.cp.mock.calls.map(([source]) => source);
        expect(copiedPaths).toContain(join(root, 'projects', 'client'));
        expect(copiedPaths).toContain(join(root, 'projects', 'server'));
        expect(copiedPaths).toContain(join(root, 'projects', 'shared'));
        expect(copiedPaths).not.toContain(join(root, 'design'));
        expect(copiedPaths).not.toContain(join(root, 'knowledge'));
        expect(copiedPaths).not.toContain(join(root, 'reviews'));
        expect(copiedPaths).toContain(join(root, '.glossary.json'));
        expect(copiedPaths).not.toContain(join(root, 'projects', 'ppt'));
        expect(copiedPaths).not.toContain(join(root, '.features'));
        expect(copiedPaths).not.toContain(join(root, 'input-sources'));
        expect(fileSystem.rename).toHaveBeenCalledWith(stage, destination);
        const filter = fileSystem.cp.mock.calls[0][2].filter;
        expect(filter(join(root, 'projects/client/src/app.ts'), '')).toBe(true);
        expect(filter(join(root, 'projects/client/node_modules'), '')).toBe(false);
        expect(filter(join(root, 'projects/client/.env.local'), '')).toBe(false);
    });

    it('rejects destinations that overlap the source tree', async () => {
        await expect(cloneDevEnv(root, {
            destination: join(root, 'clone'),
            replaceExisting: true,
        }, fileSystem)).rejects.toThrow('must be outside the DevEnv source folder');
        await expect(cloneDevEnv(root, {
            destination: dirname(root),
            replaceExisting: true,
        }, fileSystem)).rejects.toThrow('must be outside the DevEnv source folder');
        expect(fileSystem.cp).not.toHaveBeenCalled();
    });

    it('does not replace an existing destination without replacement consent', async () => {
        fileSystem.lstat.mockResolvedValue({
            isDirectory: () => true,
            isSymbolicLink: () => false,
        } as Awaited<ReturnType<DevEnvCloneFileSystem['lstat']>>);

        await expect(cloneDevEnv(root, {
            destination,
            replaceExisting: false,
        }, fileSystem)).rejects.toThrow('already exists');
        expect(fileSystem.cp).not.toHaveBeenCalled();
    });

    it('replaces an existing directory only after the new package is staged', async () => {
        fileSystem.lstat.mockResolvedValue({
            isDirectory: () => true,
            isSymbolicLink: () => false,
        } as Awaited<ReturnType<DevEnvCloneFileSystem['lstat']>>);

        const result = await cloneDevEnv(root, { destination, replaceExisting: true }, fileSystem);

        expect(result).toEqual({ destination, replacedExisting: true });
        expect(fileSystem.rename).toHaveBeenNthCalledWith(1, destination, `${stage}-previous`);
        expect(fileSystem.rename).toHaveBeenNthCalledWith(2, stage, destination);
        expect(fileSystem.rm).toHaveBeenCalledWith(`${stage}-previous`, { recursive: true });
    });

    it('rejects symbolic links and non-directory destinations', async () => {
        fileSystem.lstat.mockResolvedValue({
            isDirectory: () => false,
            isSymbolicLink: () => true,
        } as Awaited<ReturnType<DevEnvCloneFileSystem['lstat']>>);
        await expect(cloneDevEnv(root, { destination, replaceExisting: true }, fileSystem))
            .rejects.toThrow('must be a directory, not a symbolic link');

        fileSystem.lstat.mockResolvedValue({
            isDirectory: () => false,
            isSymbolicLink: () => false,
        } as Awaited<ReturnType<DevEnvCloneFileSystem['lstat']>>);
        await expect(cloneDevEnv(root, { destination, replaceExisting: true }, fileSystem))
            .rejects.toThrow('must be a directory, not a symbolic link');
    });

    it('cleans the staging directory and preserves the error when package copying fails', async () => {
        const failure = new Error('Read failed');
        fileSystem.cp.mockRejectedValue(failure);

        await expect(cloneDevEnv(root, { destination, replaceExisting: true }, fileSystem))
            .rejects.toBe(failure);
        expect(fileSystem.rm).toHaveBeenCalledWith(stage, { recursive: true, force: true });
    });
});
