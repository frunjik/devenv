import { PPTResult } from '@ppt';
import * as express from 'express';
import { performTest } from '../tests/tests';

export async function runTest(req: express.Request, res: express.Response, next: express.NextFunction) {
   
    const result = await performTest(req.params['test']);

    console.log(result);

    res.json(result);

}

