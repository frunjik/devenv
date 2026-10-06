import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import fs from 'fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ErrorRequestHandler } from 'express';
import request from 'supertest';
import { createApp } from '../src/public-api';

jest.mock('fs', () => {
    const actual = jest.requireActual<typeof import('fs')>('fs');
    return {
        ...actual,
        promises: {
            ...actual.promises,
            readFile: jest.fn(),
            writeFile: jest.fn(),
            readdir: jest.fn(async () => ['nested', 'sample.txt']),
            stat: jest.fn(),
        },
    };
});

jest.mock('node:fs/promises', () => {
    const actual = jest.requireActual<typeof import('node:fs/promises')>('node:fs/promises');
    return { ...actual, readFile: jest.fn() };
});

const fileReader = jest.mocked(fs.promises.readFile);
const currentReader = jest.mocked(readFile);
const fileWriter = jest.mocked(fs.promises.writeFile);
const folderReader = jest.mocked(fs.promises.readdir);
const statReader = jest.mocked(fs.promises.stat);

describe('files folders public API', () => {
    const root = process.cwd();
    let app: ReturnType<typeof createApp>;
    const handleError: ErrorRequestHandler = (_error, _request, response, _next) => {
        response.status(500).end();
    };

    beforeEach(() => {
        fileReader.mockReset().mockResolvedValue('initial');
        currentReader.mockReset();
        fileWriter.mockReset().mockResolvedValue(undefined);
        folderReader.mockClear();
        statReader.mockReset()
            .mockResolvedValueOnce(fs.statSync(root))
            .mockResolvedValue(fs.statSync(__filename));
        app = createApp(root);
        app.set('env', 'production');
        app.use(handleError);
    });

    it('reads an existing file', async () => {
        const response = await request(app).get('/files').query({ path: 'sample.txt' });
        expect(response.body).toEqual({ data: 'initial' });
        expect(fileReader).toHaveBeenCalledWith(join(root, 'sample.txt'), 'utf-8');
    });

    it('rejects a file request without a path', async () => {
        const response = await request(app).get('/files');
        expect(response.body).toEqual({ error: { message: "ERROR: invalid path ''" } });
        expect(fileReader).not.toHaveBeenCalled();
    });

    it('reports an unknown file path', async () => {
        fileReader.mockRejectedValueOnce(Object.assign(new Error('File not found'), { code: 'ENOENT' }));
        const response = await request(app).get('/files').query({ path: 'missing.txt' });
        expect(response.body).toEqual({ error: { message: "ERROR: invalid path 'missing.txt'" } });
    });

    it('forwards file read errors for directory paths', async () => {
        fileReader.mockRejectedValueOnce(Object.assign(new Error('Is a directory'), { code: 'EISDIR' }));
        const response = await request(app).get('/files').query({ path: '.' });
        expect(response.status).toBe(500);
    });

    it('rejects a write request without a path', async () => {
        const response = await request(app).post('/files').send({ data: 'ignored' });
        expect(response.body).toEqual({ error: { message: "ERROR: invalid path ''" } });
        expect(fileWriter).not.toHaveBeenCalled();
    });

    it('writes provided contents and confirms the successful response', async () => {
        fileWriter.mockImplementationOnce(async (filename, contents) => {
            expect(filename).toBe(join(root, 'sample.txt'));
            expect(contents).toBe('updated');
            fileReader.mockResolvedValue('updated');
        });
        const writeResponse = await request(app)
            .post('/files')
            .query({ path: 'sample.txt' })
            .send({ data: 'updated' });
        const readResponse = await request(app).get('/files').query({ path: 'sample.txt' });
        expect({ write: writeResponse.body, read: readResponse.body }).toEqual({
            write: { data: 'OK' },
            read: { data: 'updated' },
        });
        expect(fileWriter).toHaveBeenCalledWith(join(root, 'sample.txt'), 'updated', 'utf-8');
    });

    it('defaults omitted contents to an empty file and confirms success', async () => {
        fileWriter.mockImplementationOnce(async (filename, contents) => {
            expect(filename).toBe(join(root, 'empty.txt'));
            expect(contents).toBe('');
            fileReader.mockResolvedValue('');
        });
        const writeResponse = await request(app).post('/files').query({ path: 'empty.txt' }).send({});
        const readResponse = await request(app).get('/files').query({ path: 'empty.txt' });
        expect({ write: writeResponse.body, read: readResponse.body }).toEqual({
            write: { data: 'OK' },
            read: { data: '' },
        });
        expect(fileWriter).toHaveBeenCalledWith(join(root, 'empty.txt'), '', 'utf-8');
    });

    it('reports asynchronous write errors for missing directories', async () => {
        fileWriter.mockRejectedValueOnce(Object.assign(new Error('Directory not found'), { code: 'ENOENT' }));
        const response = await request(app)
            .post('/files')
            .query({ path: 'missing/file.txt' })
            .send({ data: 'unwritten' });
        expect(response.body).toEqual({
            error: { message: "ERROR: invalid path 'missing/file.txt'" },
        });
    });

    it('forwards write errors for directory paths', async () => {
        fileWriter.mockRejectedValueOnce(Object.assign(new Error('Is a directory'), { code: 'EISDIR' }));
        const response = await request(app).post('/files').query({ path: '.' }).send({ data: 'unwritten' });
        expect(response.status).toBe(500);
    });

    it('lists the server root when no folder path is supplied', async () => {
        const response = await request(app).get('/folders');
        expect(response.status).toBe(200);
        expect(folderReader).toHaveBeenCalledWith(root);
    });

    it('lists files and directories with their kinds', async () => {
        const response = await request(app).get('/folders').query({ path: '.' });
        expect(response.body.data).toEqual(expect.arrayContaining([
            { filename: 'nested', isFolder: true },
            { filename: 'sample.txt', isFolder: false },
        ]));
        expect(folderReader).toHaveBeenCalledWith(root);
        expect(statReader.mock.calls).toEqual([
            [join(root, 'nested')],
            [join(root, 'sample.txt')],
        ]);
    });

    it('rejects folder traversal paths', async () => {
        const response = await request(app).get('/folders').query({ path: '..' });
        expect(response.body).toEqual({ error: { message: "ERROR: invalid path '..'" } });
        expect(folderReader).not.toHaveBeenCalled();
    });

    it('reports unknown folder paths', async () => {
        folderReader.mockRejectedValueOnce(Object.assign(new Error('Folder not found'), { code: 'ENOENT' }));
        const response = await request(app).get('/folders').query({ path: 'missing' });
        expect(response.body).toEqual({ error: { message: "ERROR: invalid path 'missing'" } });
    });

    it('forwards folder read errors for file paths', async () => {
        folderReader.mockRejectedValueOnce(Object.assign(new Error('Not a directory'), { code: 'ENOTDIR' }));
        const response = await request(app).get('/folders').query({ path: 'sample.txt' });
        expect(response.status).toBe(500);
    });

    it('returns the last nonempty line from the current file', async () => {
        currentReader.mockResolvedValueOnce('Current\n// older entry\n// latest entry\n');

        const response = await request(app).get('/current');

        expect(response.body).toEqual({ data: '// latest entry' });
        expect(currentReader).toHaveBeenCalledWith(join(root, '.current'), 'utf8');
    });

    it('returns null when the current file is empty', async () => {
        currentReader.mockResolvedValueOnce(' \n\n');

        const response = await request(app).get('/current');

        expect(response.body).toEqual({ data: null });
    });

    it('returns null when the current file does not exist', async () => {
        currentReader.mockRejectedValueOnce(Object.assign(new Error('File not found'), { code: 'ENOENT' }));
        const response = await request(app).get('/current');

        expect(response.body).toEqual({ data: null });
    });

    it('forwards current file read errors to Express', async () => {
        currentReader.mockRejectedValueOnce(Object.assign(new Error('Is a directory'), { code: 'EISDIR' }));

        const response = await request(app).get('/current');

        expect(response.status).toBe(500);
    });

});
