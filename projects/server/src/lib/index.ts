import express, { type Express, type RequestHandler } from 'express';
import cors from 'cors';
import type { Server } from 'node:http';
import { FileSystem } from './filesystem/filesystem';
import { getFiles, postFiles } from './handlers/files';
import { getFolders } from './handlers/folders';
import { createGitCommitHandler } from './handlers/git-commit';
import { createGitLogHandler } from './handlers/git-log';
import { createGitStatusHandler } from './handlers/git-status';
import { createTestRunHandler, type TestCommandExecutor } from './handlers/test-runner';

export function createApp(
    root: string,
    testCommandExecutor?: TestCommandExecutor,
    gitCommitCwd = process.cwd(),
): Express {
    const app = express();

    app.use(express.json());
    app.use(cors());

    app.locals['fileSystem'] = new FileSystem(root);

    app.get('/files', getFiles as RequestHandler);
    app.post('/files', postFiles as RequestHandler);
    app.get('/folders', getFolders as RequestHandler);

    if (process.env['NODE_ENV'] !== 'production') {
        app.post('/tests/run', createTestRunHandler(testCommandExecutor));
        app.post('/git/commit', createGitCommitHandler(gitCommitCwd));
        app.get('/git/log', createGitLogHandler(gitCommitCwd));
        app.get('/git/status', createGitStatusHandler(gitCommitCwd));
    }

    return app;
}

export type { TestCommandEvent, TestCommandExecutor } from './handlers/test-runner';
export type { GitStatus, GitStatusFile } from './handlers/git-status';

export interface ServerListener {
    listen(app: Express, port: number): Promise<Server>;
}

const httpServerListener: ServerListener = {
    listen(app, port) {
        return new Promise((resolve, reject) => {
            const server = app.listen(port, () => {
                server.off('error', reject);
                resolve(server);
            });
            server.once('error', reject);
        });
    },
};

export function startServer(
    root = './',
    port = Number(process.env['PORT'] ?? 3000),
    listener: ServerListener = httpServerListener,
): Promise<Server> {
    return listener.listen(createApp(root), port);
}
