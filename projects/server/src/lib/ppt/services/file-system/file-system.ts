import fs from 'fs';
import path from 'path';
import { PPTFolderEntry } from './types.js';

export interface PPTFileStats {
    isDirectory(): boolean;
}

export function readFile(filename: string): Promise<string> {
    return fs.promises.readFile(filename, 'utf-8');
};

export function writeFile(filename: string, contents: string): Promise<void> {
    return fs.promises.writeFile(filename, contents);
};

export function appendFile(filename: string, contents: string): Promise<void> {
    return fs.promises.appendFile(filename, contents);
};

export function deleteFile(filename: string): Promise<void> {
    return fs.promises.rm(filename);
};

export function readFoldernames(foldername: string): Promise<string[]> {
    return fs.promises.readdir(foldername);
};

export function readFileStats(filename: string): Promise<PPTFileStats> {
    return fs.promises.stat(filename);
};

export interface PPTFS {
    readFile(filename: string): Promise<string>;
    writeFile(filename: string, contents: string): Promise<void>;
    appendFile(filename: string, contents: string): Promise<void>;
    deleteFile(filename: string): Promise<void>;
    readFoldernames(foldername: string): Promise<string[]>;
    readFileStats(filename: string): Promise<PPTFileStats>;
}

const nodeFS: PPTFS = {
    readFile,
    writeFile,
    appendFile,
    deleteFile,
    readFoldernames,
    readFileStats
};

function createFolderEntry(filename: string, isFolder: boolean): PPTFolderEntry {
    return {
        filename,
        isFolder
    };
}

export class PPTFileSystem {

    constructor(public readonly rootpath: string = '', private _FS: PPTFS = nodeFS) {}

    readFile(filename: string): Promise<string> {
        return this._FS.readFile(path.join(this.rootpath, filename));
    }

    writeFile(filename: string, contents: string): Promise<void> {
        return this._FS.writeFile(path.join(this.rootpath, filename), contents);
    }

    appendFile(filename: string, contents: string): Promise<void> {
        return this._FS.appendFile(path.join(this.rootpath, filename), contents);
    }

    deleteFile(filename: string): Promise<void> {
        return this._FS.deleteFile(path.join(this.rootpath, filename));
    }

    readFolder(foldername: string): Promise<PPTFolderEntry[]> {
        return this._FS.readFoldernames(path.join(this.rootpath, foldername))
            .then((filenames) => this.createEntriesFromFilenames(filenames));
    }

    createEntryFromFilename(filename: string): Promise<PPTFolderEntry> {
        return this._FS.readFileStats(path.join(this.rootpath, filename))
            .then((stat) => createFolderEntry(filename, stat.isDirectory()));
    }

    createEntriesFromFilenames(filenames: string[]): Promise<PPTFolderEntry[]> {
        return Promise.all(
            filenames
                .map((filename) => this.createEntryFromFilename(filename))
        );
    }
}
