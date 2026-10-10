export interface TextFileSystem {
    readFileSync(path: string, encoding: 'utf8'): string;
    writeFileSync(path: string, data: string, encoding: 'utf8'): void;
}
