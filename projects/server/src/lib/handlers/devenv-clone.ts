import { cp, lstat, mkdtemp, realpath, rename, rm } from 'node:fs/promises';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import type { DevEnvCloneRequest, DevEnvCloneResult } from '@shared';

export interface DevEnvCloneFileSystem {
    realpath(path: string): Promise<string>;
    lstat(path: string): Promise<{
        isDirectory(): boolean;
        isSymbolicLink(): boolean;
    }>;
    mkdtemp(prefix: string): Promise<string>;
    cp(
        source: string,
        destination: string,
        options: { recursive: true; filter: (source: string, destination: string) => boolean },
    ): Promise<void>;
    rename(oldPath: string, newPath: string): Promise<void>;
    rm(path: string, options: { recursive: true; force?: boolean }): Promise<void>;
}

export class DevEnvCloneError extends Error {
    constructor(message: string, readonly status = 400) {
        super(message);
        this.name = 'DevEnvCloneError';
    }
}

const PACKAGE_DIRECTORIES = [
    '.agents',
    'design',
    'projects/client',
    'projects/server',
    'projects/shared',
    'reviews',
    'scripts',
    'skills',
];

const PACKAGE_FILES = [
    '.editorconfig',
    '.gitignore',
    '.glossary',
    '.glossary.json',
    'AGENTS.md',
    'CHANGELOG.md',
    'DEVENVOPDEV.md',
    'LICENSE',
    'README.md',
    'WORKSPACE.md',
    'angular.json',
    'build-all.bat',
    'build-client.bat',
    'build-libs.bat',
    'build-server.bat',
    'build-shared.bat',
    'package-lock.json',
    'package.json',
    'start-client.bat',
    'start-server.bat',
    'tsconfig.json',
];

const EXCLUDED_NAMES = new Set([
    '.angular',
    '.cache',
    '.current',
    '.git',
    '.nx',
    '.rgr-phase',
    '.tickets.json',
    '.workflow',
    'coverage',
    'dist',
    'node_modules',
    'scratch',
    'test-run-cache',
]);

const nodeFileSystem: DevEnvCloneFileSystem = {
    realpath,
    lstat,
    mkdtemp,
    cp,
    rename,
    rm,
};

function isInsideOrEqual(parent: string, candidate: string): boolean {
    const pathFromParent = relative(parent, candidate);
    return pathFromParent === '' || (pathFromParent !== '..'
        && !pathFromParent.startsWith(`..${sep}`)
        && !isAbsolute(pathFromParent));
}

function shouldCopy(source: string): boolean {
    const name = basename(source);
    return !EXCLUDED_NAMES.has(name)
        && name !== '.env'
        && !name.startsWith('.env.')
        && !name.endsWith('.log')
        && !name.endsWith('.tmp');
}

function isMissingFileError(error: unknown): boolean {
    return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}

function messageFor(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown filesystem error';
}

export async function cloneDevEnv(
    root: string,
    request: DevEnvCloneRequest,
    fileSystem: DevEnvCloneFileSystem = nodeFileSystem,
): Promise<DevEnvCloneResult> {
    if (!request.destination.trim() || !isAbsolute(request.destination)) {
        throw new DevEnvCloneError('Destination must be an absolute server-local folder path.');
    }

    const sourceRoot = await fileSystem.realpath(root);
    const requestedDestination = resolve(request.destination);
    let destinationParent: string;
    try {
        destinationParent = await fileSystem.realpath(dirname(requestedDestination));
    } catch (error) {
        if (isMissingFileError(error)) {
            throw new DevEnvCloneError('The destination parent folder must already exist.');
        }
        throw error;
    }

    let destination = resolve(destinationParent, basename(requestedDestination));
    if (isInsideOrEqual(sourceRoot, destination) || isInsideOrEqual(destination, sourceRoot)) {
        throw new DevEnvCloneError('Destination must be outside the DevEnv source folder.');
    }

    let existing = false;
    try {
        const destinationStat = await fileSystem.lstat(destination);
        if (destinationStat.isSymbolicLink() || !destinationStat.isDirectory()) {
            throw new DevEnvCloneError('An existing destination must be a directory, not a symbolic link.');
        }
        destination = await fileSystem.realpath(destination);
        if (isInsideOrEqual(sourceRoot, destination) || isInsideOrEqual(destination, sourceRoot)) {
            throw new DevEnvCloneError('Destination must be outside the DevEnv source folder.');
        }
        existing = true;
    } catch (error) {
        if (error instanceof DevEnvCloneError || !isMissingFileError(error)) {
            throw error;
        }
    }

    if (existing && !request.replaceExisting) {
        throw new DevEnvCloneError('Destination already exists; confirm replacement before exporting.', 409);
    }

    const stagingDirectory = await fileSystem.mkdtemp(join(destinationParent, '.devenv-clone-'));
    let stagingDirectoryExists = true;
    let backupDirectory: string | undefined;
    try {
        for (const resource of [...PACKAGE_DIRECTORIES, ...PACKAGE_FILES]) {
            await fileSystem.cp(
                join(sourceRoot, resource),
                join(stagingDirectory, resource),
                { recursive: true, filter: shouldCopy },
            );
        }

        if (existing) {
            backupDirectory = `${stagingDirectory}-previous`;
            await fileSystem.rename(destination, backupDirectory);
        }

        try {
            await fileSystem.rename(stagingDirectory, destination);
            stagingDirectoryExists = false;
        } catch (installError) {
            if (backupDirectory) {
                try {
                    await fileSystem.rename(backupDirectory, destination);
                    backupDirectory = undefined;
                } catch (rollbackError) {
                    throw new AggregateError(
                        [installError, rollbackError],
                        `Could not install the clone or restore the previous destination; backup remains at ${backupDirectory}.`,
                    );
                }
            }
            throw installError;
        }

        if (backupDirectory) {
            try {
                await fileSystem.rm(backupDirectory, { recursive: true });
            } catch (error) {
                return {
                    destination,
                    replacedExisting: true,
                    warning: `Clone created, but the previous destination could not be removed from ${backupDirectory}: ${messageFor(error)}`,
                };
            }
        }

        return { destination, replacedExisting: existing };
    } catch (error) {
        if (stagingDirectoryExists) {
            try {
                await fileSystem.rm(stagingDirectory, { recursive: true, force: true });
            } catch (cleanupError) {
                throw new AggregateError(
                    [error, cleanupError],
                    `Clone failed and its staging folder could not be removed: ${stagingDirectory}`,
                );
            }
        }
        throw error;
    }
}

export function createDevEnvCloneHandler(
    root: string,
    clone: typeof cloneDevEnv = cloneDevEnv,
) {
    return async (
        request: import('express').Request,
        response: import('express').Response,
        next: import('express').NextFunction,
    ): Promise<void> => {
        const body: unknown = request.body;
        if (!body || typeof body !== 'object'
            || !('destination' in body) || typeof body.destination !== 'string'
            || !body.destination.trim() || !isAbsolute(body.destination)
            || !('replaceExisting' in body) || typeof body.replaceExisting !== 'boolean') {
            response.status(400).json({
                error: { message: 'Provide an absolute destination path and replacement confirmation.' },
            });
            return;
        }

        try {
            const result = await clone(root, {
                destination: body.destination,
                replaceExisting: body.replaceExisting,
            });
            response.json({ data: result });
        } catch (error) {
            if (error instanceof DevEnvCloneError) {
                response.status(error.status).json({ error: { message: error.message } });
                return;
            }
            next(error);
        }
    };
}
