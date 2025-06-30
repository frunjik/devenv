import { SuccessResponseBody } from '../types.js';
import * as express from 'express';
import { PPTEventStore } from '../../ppt/services/ppt-eventstore';

export async function getPPTState(req: express.Request, res: express.Response, next: express.NextFunction) {
   
    const store = PPTEventStore.current();

    const response: SuccessResponseBody<any> = {
        data: store.getState()
    };

    res.json(response);
}

export async function getPPTChanges(req: express.Request, res: express.Response, next: express.NextFunction) {
   
    const store = PPTEventStore.current();

    const response: SuccessResponseBody<any> = {
        data: store.getChanges()
    };

    res.json(response);
}

export async function getPPTInverse(req: express.Request, res: express.Response, next: express.NextFunction) {
   
    const store = PPTEventStore.current();

    const response: SuccessResponseBody<any> = {
        data: store.getInverse()
    };

    res.json(response);
}
