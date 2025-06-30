import * as express from 'express';
import { PPTDataStore } from '../../ppt/services/ppt-datastore';

const store = PPTDataStore.current();

export async function getPPTModels(req: express.Request, res: express.Response, next: express.NextFunction) {
    res.json({
        data: store.getModels()
    });
}
