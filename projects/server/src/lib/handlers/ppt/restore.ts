import { PPTManager } from '../../ppt/services/ppt-manager';
import { SuccessResponseBody } from '../types.js';
import * as express from 'express';

export async function getPPTRestore(req: express.Request, res: express.Response, next: express.NextFunction) {
   
    const manager = PPTManager.current();

    manager.restore()
        .then((data) => {
            const response: SuccessResponseBody<any> = {
                data
            };
            res.json(response);
        });
}
