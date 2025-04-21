import { PPTErrorCodes, PPTResult, createFailureResult } from '@ppt';

export function performTest(testname: string): PPTResult<any> {
    switch(testname) {
        case 'test': 
            return {
                success: testname
            };
    }
    return createFailureResult(PPTErrorCodes.Incorrect, `test '${testname}' not found`)
}
