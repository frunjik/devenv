import type { TextFileSystem } from '../lib/text-file-system.types';

export interface MemoryTextFileSystem extends TextFileSystem {
    readonly files: ReadonlyMap<string, string>;
}

export function createMemoryTextFileSystem(initialFiles: Readonly<Record<string, string>> = {}): MemoryTextFileSystem {
    const files = new Map(Object.entries(initialFiles));
    return {
        files,
        readFileSync(path) {
            const content = files.get(path);
            if (content === undefined) {
                // Mirror Node's fs error shape so consumers checking error.code === 'ENOENT' behave as with real files.
                throw Object.assign(new Error(`ENOENT: no such file or directory, open '${path}'`), { code: 'ENOENT' });
            }
            return content;
        },
        writeFileSync(path, data) {
            files.set(path, data);
        },
    };
}
