import * as express from 'express';
import { FileSystem } from '../filesystem/filesystem.js';
import { PPTFolderEntry, PPTResult } from '@ppt';

export async function getFolders(req: express.Request, res: express.Response, next: express.NextFunction) {
   
    const pathname = req.query['path'] as string ?? '';

    if (pathname.includes('..')) {

        const response = {
            failure: [
                {
                    code: 'Incorrect',
                    message: `ERROR: invalid path '${pathname}'`
                }
            ]
        };

        res
            .status(400)
            .send(response);

    } else {

        try {
    
            const filesystem: FileSystem = req.app.locals['fileSystem'];
            const data: PPTFolderEntry[] = await filesystem.readFolder(pathname);
    
            const response: PPTResult<PPTFolderEntry[]> = {
                success: data
            };
    
            res.json(response);
    
        } catch (err: any) {
    
            if ('ENOENT' === err.code) {
    
                const response = {
                    failure: [
                        {
                            code: 'Incorrect',
                            message: `ERROR: invalid path '${pathname}'`
                        }
                    ]
                };
        
                res
                    .status(400)
                    .send(response);
    
            } else {
    
                next(err);
    
            }
    
        }
    }    
}
