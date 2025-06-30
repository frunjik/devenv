import express, { Express, Request, RequestHandler, Response } from 'express';
import cors from 'cors';
import { FileSystem } from './filesystem/filesystem';
import { getFiles, postFiles } from './handlers/files';
import { getFolders } from './handlers/folders';
import { getPPTModels, getPPTSlices, postPPTCommands, getPPTState, getPPTChanges, getPPTInverse, postPPTPatches, getPPTRestore } from './handlers/ppt';
import { PPTEventStore } from './ppt/services/ppt-eventstore';

function run(root: string, port: number) {
    const app = express();
    
    app.use(express.json());
    app.use(cors());
    
    app.locals['fileSystem'] = new FileSystem(root);
    
    // devenv
    app.get ('/files',   getFiles   as RequestHandler);
    app.post('/files',   postFiles  as RequestHandler);
    app.get ('/folders', getFolders as RequestHandler);

    // PPT
    app.get ('/ppt/models', getPPTModels as RequestHandler);
    app.get ('/ppt/slices', getPPTSlices as RequestHandler);

    app.get ('/ppt/state', getPPTState as RequestHandler);
    app.get ('/ppt/changes', getPPTChanges as RequestHandler);
    app.get ('/ppt/inverse', getPPTInverse as RequestHandler);
    app.get ('/ppt/restore', getPPTRestore as RequestHandler);

    app.post('/ppt/patches', postPPTPatches as RequestHandler);
    app.post('/ppt/commands', postPPTCommands as RequestHandler);
    
    app.listen(port, () => {
        console.log(`serving "${root}" on port ${port}`);
    });
}

try {

    PPTEventStore.current().restore();

    const root = './';
    const port = 3000;
    
    run(root, port);

} catch(e) {
    console.error(e);
}
