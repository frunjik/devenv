import express, { RequestHandler } from 'express';
import cors from 'cors';
import { FileSystem } from './filesystem/filesystem';
import { getFiles, postFiles } from './handlers/files';
import { getFolders } from './handlers/folders';

function run(root: string, port: number): Promise<void> {
    return new Promise((resolve, reject) => {
        const app = express();

        app.use(express.json());
        app.use(cors());

        app.locals['fileSystem'] = new FileSystem(root);

        app.get('/files', getFiles as RequestHandler);
        app.post('/files', postFiles as RequestHandler);
        app.get('/folders', getFolders as RequestHandler);

        const server = app.listen(port, () => {
            server.off('error', reject);
            console.log(`serving "${root}" on port ${port}`);
            resolve();
        });
        server.once('error', reject);
    });
}

run('./', 3000).catch((error: unknown) => console.error(error));
