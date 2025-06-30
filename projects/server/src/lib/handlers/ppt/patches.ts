import { PPTManager } from '../../ppt/services/ppt-manager';
import { EMElement } from '@shared';
import { SuccessResponseBody } from '../types.js';
import * as express from 'express';
import { Patch } from 'immer';

export async function postPPTPatches(req: express.Request, res: express.Response, next: express.NextFunction) {
    
    const patches = req.body as Patch[];

    const manager = PPTManager.current();

    const response: SuccessResponseBody<EMElement> = {
        data: manager.postPatches(patches)
    };

    res.json(response);
}
