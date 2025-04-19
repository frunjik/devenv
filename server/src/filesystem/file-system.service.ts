import fs from 'fs';
import path from 'path';
import { PPTFolderEntry } from './types.js';

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

async function createFolderEntries(foldername: string): Promise<PPTFolderEntry[]> {
    const names = await fs.promises.readdir(foldername);
    const stats = await Promise.all(names.map(e => fs.promises.stat(path.join(foldername, e))));
    return names.map((name, i) => createFolderEntry(name, stats[i].isDirectory()));
}

export class PPTFileSystemService {
    constructor(public readonly rootpath: string = '') {}

    path(folder: string, filename: string): string {
        return path.join(this.rootpath, folder, filename);
    }

    readFile(filename: string): Promise<string> {
        return readFile(this.path(this.rootpath, filename));
    }

    writeFile(filename: string, contents: string): Promise<string> {
        return writeFile(this.path(this.rootpath, filename), contents);
    }

    readFolder(foldername: string): Promise<PPTFolderEntry[]> {
        return createFolderEntries(this.path(this.rootpath, foldername));
    }
}
