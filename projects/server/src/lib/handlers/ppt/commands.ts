import { PPTManager } from '../../ppt/services/ppt-manager';
import { EMElement } from '@shared';
import { SuccessResponseBody } from '../types.js';
import * as express from 'express';

export async function postPPTCommands(req: express.Request, res: express.Response, next: express.NextFunction) {
   
    const command = req.body as EMElement;

    const manager = PPTManager.current();

    const response: SuccessResponseBody<EMElement> = {
        data: manager.postCommand(command)
    };

    res.json(response);
}
