import * as express from 'express';
import { FileSystem } from '../filesystem/filesystem.js';
import { PPTResult } from '@ppt';

export async function getFiles(req: express.Request, res: express.Response, next: express.NextFunction) {
   
    const filename = req.query['path'] as string;

    if (!filename) {

        const response = {
            failure: [
                {
                    code: 'Incorrect',
                    message: `ERROR: invalid path '${filename}'`
                }
            ]
        };

        res
            .status(400)
            .send(response);

    } else {

        try {

            const filesystem: FileSystem = req.app.locals['fileSystem'];
            const data: string = await filesystem.readFile(filename);

            const response: PPTResult<string> = {
                success: data
            };

            res.json(response);

        } catch (err: any) {

            if ('ENOENT' === err.code) {

                const response = {
                    failure: [
                        {
                            code: 'Incorrect',
                            message: `ERROR: invalid path '${filename}'`
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

export async function postFiles(req: express.Request, res: express.Response, next: express.NextFunction) {
   
    const contents = req.body.data  as string || '';
    const filename = req.query['path'] as string;

    if (!filename) {

        const response = {
            failure: [
                {
                    code: 'Incorrect',
                    message: `ERROR: invalid path '${filename}'`
                }
            ]
        };

        res
            .status(400)
            .send(response);

    } else {

        try {

            const filesystem: FileSystem = req.app.locals['fileSystem'];
            filesystem.writeFile(filename, contents);

            const response: PPTResult<string> = {
                success: 'OK'
            };

            res.json(response);

        } catch (err: any) {

            if ('ENOENT' === err.code) {

                const response = {
                    failure: [
                        {
                            code: 'Incorrect',
                            message: `ERROR: invalid path '${filename}'`
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
