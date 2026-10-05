export interface PPTFolderEntry {
    filename: string;
    isFolder: boolean;
}

export type FolderEntry = PPTFolderEntry;

export interface PPTFileStats {
    isDirectory(): boolean;
}

export interface PPTFS {
    readFile(filename: string): Promise<string>;
    writeFile(filename: string, contents: string): Promise<void>;
    readFoldernames(foldername: string): Promise<string[]>;
    readFileStats(filename: string): Promise<PPTFileStats>;
}
