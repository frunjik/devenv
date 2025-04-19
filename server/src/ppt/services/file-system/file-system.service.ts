import fs from 'fs';
import path from 'path';
import { PPTFolderEntry } from './types.js';

export interface PPTFS {
    readFile(filename: string): Promise<string>;
    writeFile(filename: string, contents: string): Promise<void>;
    readFolder(foldername: string): Promise<PPTFolderEntry[]>;
}

const nodeFS: PPTFS = {
    readFile: function(filename: string): Promise<string> {
        return fs.promises.readFile(filename, 'utf-8');
    },
    writeFile: function(filename: string, contents: string): Promise<void> {
        return fs.promises.writeFile(filename, contents);
    },
    readFolder: function(foldername: string): Promise<PPTFolderEntry[]> {
        return readFoldernames(foldername)
            .then(createFolderEntriesFromFilenames);
    }
};

export function readFile(filename: string): Promise<string> {
    return fs.promises.readFile(filename, 'utf-8');
}

export function writeFile(filename: string, contents: string): Promise<any> {
    return fs.promises.writeFile(filename, contents, 'utf-8');
}

function createFolderEntry(filename: string, isFolder: boolean): PPTFolderEntry {
    return {
        filename,
        isFolder
    };
}

async function readFoldernames(foldername: string): Promise<string[]> {
    return fs.promises.readdir(foldername);
}

async function createFolderEntriesFromFilenames(filenames: string[]): Promise<PPTFolderEntry[]> {
    return Promise.all(filenames.map((filename) => {
        return fs.promises.stat(filename).then((stat) => {
            return createFolderEntry(filename, stat.isDirectory())
        })
    }));
}

// async function createFolderEntries(foldername: string): Promise<PPTFolderEntry[]> {
//     const names = await fs.promises.readdir(foldername);
//     const stats = await Promise.all(names.map(e => fs.promises.stat(path.join(foldername, e))));
//     return names.map((name, i) => createFolderEntry(name, stats[i].isDirectory()));
// }

export class PPTFileSystemService implements PPTFS {

    private _useFS: PPTFS;

    constructor(public readonly rootpath: string = '', useFS: PPTFS = nodeFS) {
        this._useFS = useFS;
    }

    readFile(filename: string): Promise<string> {
        return this._useFS.readFile(path.join(this.rootpath, filename));
    }

    writeFile(filename: string, contents: string): Promise<void> {
        return this._useFS.writeFile(path.join(this.rootpath, filename), contents);
    }

    readFolder(foldername: string): Promise<PPTFolderEntry[]> {
        return this._useFS.readFolder(path.join(this.rootpath, foldername));
    }
}
