import { PPTResult } from '@ppt';
import * as express from 'express';
import { performTest } from '../tests/tests';

export async function runTest(req: express.Request, res: express.Response, next: express.NextFunction) {
   
    res.json(performTest(req.params['test']));

}

