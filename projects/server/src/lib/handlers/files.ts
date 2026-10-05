import * as express from 'express';
import type { FailureResponseBody, SuccessResponseBody } from '@ppt';
import { FileSystem } from '../filesystem/filesystem.js';

export function getFiles(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
   
    const filename = req.query['path'] as string;

    if (!filename) {

        const response: FailureResponseBody = {
            error: {
                message: `ERROR: invalid path ''`
            }
        };

        res
            .status(400)
            .send(response);
        return Promise.resolve();

    } else {

        const filesystem: FileSystem = req.app.locals['fileSystem'];
        return Promise.resolve(filesystem.readFile(filename))
            .then((data) => {
                const response: SuccessResponseBody<string> = {
                    data
                };

                res.json(response);
            })
            .catch((err: NodeJS.ErrnoException) => {
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
            });
    }
}

export function postFiles(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
   
    const contents = req.body.data  as string || '';
    const filename = req.query['path'] as string;

    if (!filename) {

        const response: FailureResponseBody = {
            error: {
                message: `ERROR: invalid path ''`
            }
        };

        res
            .status(400)
            .send(response);
        return Promise.resolve();

    } else {

        const filesystem: FileSystem = req.app.locals['fileSystem'];
        return Promise.resolve(filesystem.writeFile(filename, contents))
            .then(() => {
                const response: SuccessResponseBody<string> = {
                    data: 'OK'
                };

                res.json(response);
            })
            .catch((err: NodeJS.ErrnoException) => {
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
            });
    }
}
