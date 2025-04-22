import { readFile } from '../filesystem/filesystem';
import rubico from 'rubico';
import { readFolderNames } from '../ppt/services/file-system/file-system';

export function readMetaFile(pathname: string, filename: string): Promise<any> {
    return rubico.pipe(
        pathname + filename,
        [
            readFile,
            (contents: string) => ({
                filename,
                contents
            })
        ]
    );
}

export function assembleMetaIISelectDatasets(): Promise<any> {

    // const pathname = './projects/metaii/src/data/code/';
    // const filename = 'c00a__demo__compiled_assignments_c[i01a_c01bjs]_.txt';

    // return rubico.pipe(
    //     pathname + filename,
    //     [
    //         readFile,
    //         (contents: string) => ({
    //             filename,
    //             contents
    //         })
    //     ]
    // );

    // return Promise.all([
    //     readFolderNames('./projects/metaii/src/data/code'),
    //     readFolderNames('./projects/metaii/src/data/input'),
    // ]);

    // return Promise.all([
    //     readFolderNames('./projects/metaii/src/data/code'),
    //     readFolderNames('./projects/metaii/src/data/input'),
    // ]);


    const pathname = './projects/metaii/src/data/input/';

    return rubico.pipe(
        pathname,
        [
            readFolderNames,
            rubico.map((filename: string) => readMetaFile(pathname, filename))
        ]
    )


}

