import * as express from 'express';
import { FailureResponseBody, SuccessResponseBody } from './types.js';
import { FileSystem } from '../filesystem/filesystem.js';
import { FolderEntry } from '../filesystem/types.js';

export function getFolders(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
   
    const foldername = req.query['path'] as string ?? '';

    if (foldername.includes('..')) {

        const response: FailureResponseBody = {
            error: {
                message: `ERROR: invalid path '${foldername}'`
            }
        };

        res
            .status(400)
            .send(response);
        return Promise.resolve();

    } else {

        const filesystem: FileSystem = req.app.locals['fileSystem'];
        return Promise.resolve(filesystem.readFolder(foldername))
            .then((data: FolderEntry[]) => {
                const response: SuccessResponseBody<FolderEntry[]> = {
                    data
                };

                res.json(response);
            })
            .catch((err: NodeJS.ErrnoException) => {
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
            });
    }    
}
