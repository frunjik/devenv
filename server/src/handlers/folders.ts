import * as express from 'express';
import { FailureResponseBody, SuccessResponseBody } from './types.js';
import { FileSystem } from '../filesystem/filesystem.js';
import { FolderEntry } from '../filesystem/types.js';

export async function getFolders(req: express.Request, res: express.Response, next: express.NextFunction) {
   
    const foldername = req.query.path as string ?? '';

    if (foldername.includes('..')) {

        const response: FailureResponseBody = {
            error: {
                message: `ERROR: invalid path '${foldername}'`
            }
        };

        res
            .status(400)
            .send(response);

    } else {

        try {
    
            const filesystem: FileSystem = req.app.locals.fileSystem;
            const data: FolderEntry[] = await filesystem.readFolder(foldername);
    
            const response: SuccessResponseBody<FolderEntry[]> = {
                data
            };
    
            res.json(response);
    
        } catch (err: any) {
    
            if ('ENOENT' === err.code) {
    
                const result: FailureResponseBody = {
                    error: {
                        message: `ERROR: invalid path '${foldername}'`
                    }
                };
    
                res
                    .status(400)
                    .send(result);
    
            } else {
    
                next(err);
    
            }
    
        }
    }    
}
