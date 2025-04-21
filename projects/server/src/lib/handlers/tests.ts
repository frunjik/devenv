import * as express from 'express';
// import { FailureResponseBody } from './types.js';
import { SuccessResponseBody } from './types.js';

export async function runTest(req: express.Request, res: express.Response, next: express.NextFunction) {
   
    const testname = req.params['test'] as string;

    const response: SuccessResponseBody<string> = {
        data: testname
    };

    res.json(response);

}

