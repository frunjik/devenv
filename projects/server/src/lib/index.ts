import express, { type Express, type RequestHandler } from 'express';
import cors from 'cors';
import type { Server } from 'node:http';
import serverPackage from '../../package.json';
import { FileSystem } from './filesystem/filesystem';
import { getFiles, postFiles } from './handlers/files';
import { getFolders } from './handlers/folders';
import { createGitCommitHandler } from './handlers/git-commit';
import { createGitDiffHandler } from './handlers/git-diff';
import { createGitLogHandler } from './handlers/git-log';
import { createGitStatusHandler } from './handlers/git-status';
import { createGitUndoHandler } from './handlers/git-undo';
import { createCurrentEntryHandler } from './handlers/current-entry';
import { createLinesHandler } from './handlers/lines';
import { createTicketsRouter } from './handlers/tickets';
import { InMemoryTicketStore } from './storage/in-memory-ticket-store';
import type { TicketStore } from './storage/ticket-store';
import {
    createAuthenticationMiddleware,
    getDevelopmentAuthenticationService,
    type AuthenticationService,
} from './authentication';
import {
    createLastTestRunHandler,
    createTestRunHandler,
    createTestRunCacheStatusHandler,
    type TestCommandExecutor,
} from './handlers/test-runner';

export interface CreateAppOptions {
    testCommandExecutor?: TestCommandExecutor;
    gitCommitCwd?: string;
    testRunCacheDirectory?: string;
    authenticationService?: AuthenticationService;
    ticketStore?: TicketStore;
}

export function createApp(root: string, options: CreateAppOptions = {}): Express {
    const {
        testCommandExecutor,
        gitCommitCwd = process.cwd(),
        testRunCacheDirectory,
        authenticationService,
        ticketStore = new InMemoryTicketStore(),
    } = options;
    const app = express();

    app.use(express.json());
    app.use(cors());

    const configuredAuthentication = authenticationService
        ?? (process.env['NODE_ENV'] !== 'production' ? getDevelopmentAuthenticationService() : undefined);
    if (configuredAuthentication) {
        app.use(createAuthenticationMiddleware(configuredAuthentication));
    }

    app.locals['fileSystem'] = new FileSystem(root);

    app.get('/files', getFiles as RequestHandler);
    app.post('/files', postFiles as RequestHandler);
    app.get('/folders', getFolders as RequestHandler);
    app.get('/current', createCurrentEntryHandler(root));
    app.get('/version', (_request, response) => response.json({ data: serverPackage.version }));
    app.use(createTicketsRouter(ticketStore));
    app.get('/glossary', createLinesHandler(root, ['.glossary', '.terms']));
    if (process.env['NODE_ENV'] !== 'production') {
        app.post('/tests/run', createTestRunHandler(testCommandExecutor, testRunCacheDirectory));
        app.get('/tests/last', createLastTestRunHandler(testRunCacheDirectory));
        app.get('/tests/cache/status', createTestRunCacheStatusHandler(testRunCacheDirectory));
        app.post('/git/commit', createGitCommitHandler(gitCommitCwd));
        app.post('/git/undo', createGitUndoHandler(gitCommitCwd));
        app.get('/git/diff', createGitDiffHandler(gitCommitCwd));
        app.get('/git/log', createGitLogHandler(gitCommitCwd));
        app.get('/git/status', createGitStatusHandler(gitCommitCwd));
    }

    return app;
}

export type {
    LastTestRun,
    TestCommandEvent,
    TestCommandExecutor,
    TestRunCacheStatus,
} from './handlers/test-runner';
export type { AuthenticatedPrincipal, AuthenticationService } from './authentication';
export type { TicketStore } from './storage/ticket-store';
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
    authenticationService?: AuthenticationService,
): Promise<Server> {
    return listener.listen(createApp(root, { authenticationService }), port);
}
