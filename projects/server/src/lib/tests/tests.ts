import { PPTResult } from '@ppt';

function testNotFound(testname: string) {
    return {
        failure: [
            {
                code: 'Incorrect',
                message: `test '${testname}' not found`
            }
        ]
    }
}

export function performTest(testname: string): PPTResult<any> {

    switch(testname) {

        case 'test': 
            return {
                success: testname
            };

    }

    return testNotFound(testname);
}
