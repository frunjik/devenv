import { PPTResult } from '@ppt';
import * as express from 'express';

export async function runTest(req: express.Request, res: express.Response, next: express.NextFunction) {
   
    const testname = req.params['test'] as string;

    const response: PPTResult<string> = {
        success: testname
    };

    res.json(response);

}

