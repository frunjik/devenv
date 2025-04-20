import express, { Express, Request, RequestHandler, Response } from 'express';
import cors from 'cors';
import { FileSystem } from './filesystem/filesystem.js';
import { getFiles, postFiles } from './handlers/files.js';
import { getFolders } from './handlers/folders.js';

function run(root: string, port: number) {
    const app = express();
    
    app.use(express.json());
    app.use(cors());
    
    app.locals.fileSystem = new FileSystem(root);
    
    app.get ('/files',   getFiles   as RequestHandler);
    app.post('/files',   postFiles  as RequestHandler);
    app.get ('/folders', getFolders as RequestHandler);
    
    app.listen(port, () => {
        console.log(`serving "${root}" on port ${port}`);
    });
}

try {

    const root = '../';
    const port = 3000;
    
    run(root, port);

} catch(e) {
    console.error(e);
}
