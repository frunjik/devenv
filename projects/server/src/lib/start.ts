import express, { Express, Request, RequestHandler, Response } from 'express';
import cors from 'cors';
import { FileSystem } from './filesystem/filesystem';
import { getFiles, postFiles } from './handlers/files';
import { getFolders } from './handlers/folders';
import { runTest } from './handlers/tests';

// '(GET|POST) /path/:param'
type PPTRequestMessage = string;

export interface PPTRoute {
    message: PPTRequestMessage,
    handler: Function;
};

const routes: PPTRoute[] = [
    {
        message: 'GET /tests/:test', 
        handler: runTest
    },
    {
        message: 'GET /files', 
        handler: getFiles
    },
    {
        message: 'POST /files', 
        handler: postFiles
    },
    {
        message: 'GET /folders', 
        handler: getFolders
    }
];

function setupRoutes(app: Express, routes: PPTRoute[]) {
    const methods: Record<string, Function> = {
        GET: app.get,
        POST: app.post
    };

    routes.forEach((route) => {

        const [m, u] = route.message.split(' ');

        const f = methods[m];

        if (f) {

            f.apply(app, [u, route.handler]);

        } else {

            throw new Error(`unknown HTTP method '${m}' for url: '${u}'`);
        }
    });
}

export function run(root: string, port: number) {
    const app = express();
    
    app.use(express.json());
    app.use(cors());
    
    app.locals['fileSystem'] = new FileSystem(root);

    setupRoutes(app, routes);
    
    app.listen(port, () => {
        console.log(`serving "${root}" on port ${port}`);
    });
}

try {

    const root = './';
    const port = 3000;
    
    run(root, port);

} catch(e) {
    console.error(e);
}
