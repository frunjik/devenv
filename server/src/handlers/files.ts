import * as express from 'express';
import { FailureResponseBody, SuccessResponseBody } from './types.js';
import { FileSystem } from '../filesystem/filesystem.js';

export async function getFiles(req: express.Request, res: express.Response, next: express.NextFunction) {
   
    const filename = req.query.path as string;

    if (!filename) {

        const response: FailureResponseBody = {
            error: {
                message: `ERROR: invalid path ''`
            }
        };

        res
            .status(400)
            .send(response);

    } else {

        try {

            const filesystem: FileSystem = req.app.locals.fileSystem;
            const data: string = await filesystem.readFile(filename);

            const response: SuccessResponseBody<string> = {
                data
            };

            res.json(response);

        } catch (err: any) {

            if ('ENOENT' === err.code) {

                const response: FailureResponseBody = {
                    error: {
                        message: `ERROR: invalid path '${filename}'`
                    }
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
    const filename = req.query.path as string;

    if (!filename) {

        const response: FailureResponseBody = {
            error: {
                message: `ERROR: invalid path ''`
            }
        };

        res
            .status(400)
            .send(response);

    } else {

        try {

            const filesystem: FileSystem = req.app.locals.fileSystem;
            filesystem.writeFile(filename, contents);

            const response: SuccessResponseBody<string> = {
                data: 'OK'
            };

            res.json(response);

        } catch (err: any) {

            if ('ENOENT' === err.code) {

                const response: FailureResponseBody = {
                    error: {
                        message: `ERROR: invalid path '${filename}'`
                    }
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
