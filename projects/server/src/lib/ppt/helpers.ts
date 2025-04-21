import { readFile } from "../filesystem/filesystem";

export function readFiles(filenames: string[]): Promise<string[]> {
    return Promise
        .all(
            filenames
                .map(readFile)
        );
}
