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
            const address = server.address();
            const listeningPort = typeof address === 'object' && address !== null
                ? address.port
                : port;
            console.log(`serving "${root}" on port ${listeningPort}`);
            resolve();
        });
        server.once('error', reject);
    });
}

const port = Number(process.env['PORT'] ?? 3000);
run('./', port).catch((error: unknown) => console.error(error));
