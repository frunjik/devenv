import { PPTResult } from '@ppt';
import { readFolderNames } from '../ppt/services/file-system/file-system';

export function assembleMetaIISelectDatasets(): Promise<any> {
    return readFolderNames('./projects/metaii/src/data/input');
}

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

export async function performTest(testname: string): Promise<PPTResult<any>> {

    switch(testname) {

        case 'test': 
            return {
                success: testname
            };

        case 'metaii': 
            return {
                success: await assembleMetaIISelectDatasets()
            };

    }

    return testNotFound(testname);
}
