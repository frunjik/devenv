import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { Server } from 'node:http';
import express from 'express';
import { requestApp } from './support/request-app';

function echoApp() {
    const app = express();
    app.use(express.json());
    app.use(express.text({ type: 'text/plain' }));
    app.use(express.urlencoded({ extended: false }));
    app.get('/echo', (request, response) => {
        response.json({ query: request.query, authorization: request.headers['authorization'] ?? null });
    });
    app.post('/echo', (request, response) => {
        response.status(201).json({ contentType: request.headers['content-type'] ?? null, body: request.body ?? null });
    });
    app.get('/text', (_request, response) => {
        response.type('text/plain').send('plain words');
    });
    app.get('/stream', (_request, response) => {
        response.type('application/x-ndjson');
        response.write('{"n":1}\n');
        response.write(Buffer.from('{"n":2}\n'));
        response.end();
    });
    app.get('/empty', (_request, response) => {
        response.status(204).end();
    });
    app.get('/broken', () => {
        throw new Error('handler failed');
    });
    app.set('env', 'production');
    return app;
}

describe('in-process Express request helper', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('sends GET requests with query and headers without opening a listener', async () => {
        // Spying on the listener boundary proves the helper never binds a port.
        const listen = jest.spyOn(Server.prototype, 'listen');

        const response = await requestApp(echoApp())
            .get('/echo')
            .query({ path: 'sample.txt', depth: 2 })
            .set('Authorization', 'Bearer token');

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toContain('application/json');
        expect(response.body).toEqual({ query: { path: 'sample.txt', depth: '2' }, authorization: 'Bearer token' });
        expect(JSON.parse(response.text)).toEqual(response.body);
        expect(listen).not.toHaveBeenCalled();
    });

    it('serializes object bodies as JSON', async () => {
        const response = await requestApp(echoApp()).post('/echo').send({ ticket: { title: 'Wrong aisle' } });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ contentType: 'application/json', body: { ticket: { title: 'Wrong aisle' } } });
    });

    it('sends string bodies with the content type set before or after send, defaulting to a form', async () => {
        const app = echoApp();

        const late = await requestApp(app).post('/echo').send('{"value":42}').set('Content-Type', 'application/json');
        const text = await requestApp(app).post('/echo').set('Content-Type', 'text/plain').send('42');
        const form = await requestApp(app).post('/echo').send('name=Ada');
        const none = await requestApp(app).post('/echo');

        expect(late.body).toEqual({ contentType: 'application/json', body: { value: 42 } });
        expect(text.body).toEqual({ contentType: 'text/plain', body: '42' });
        expect(form.body).toEqual({ contentType: 'application/x-www-form-urlencoded', body: { name: 'Ada' } });
        expect(none.body).toEqual({ contentType: null, body: null });
    });

    it('collects text, streamed and empty responses, leaving body empty for non-JSON content', async () => {
        const app = echoApp();

        const text = await requestApp(app).get('/text');
        const stream = await requestApp(app).get('/stream');
        const empty = await requestApp(app).get('/empty');

        expect(text.text).toBe('plain words');
        expect(text.body).toEqual({});
        expect(stream.headers['content-type']).toContain('application/x-ndjson');
        expect(stream.text).toBe('{"n":1}\n{"n":2}\n');
        expect(empty.status).toBe(204);
        expect(empty.text).toBe('');
        expect(empty.body).toEqual({});
    });

    it('reports handler failures through the app error handling', async () => {
        const response = await requestApp(echoApp()).get('/broken');

        expect(response.status).toBe(500);
    });

    it('parses JSON media types and rejects malformed JSON responses', async () => {
        const app = express();
        app.get('/problem', (_request, response) => {
            response.type('application/problem+json').send('{"title":"Missing"}');
        });
        app.get('/malformed', (_request, response) => {
            response.type('application/json').send('{');
        });
        app.get('/untyped', (_request, response) => {
            response.end('{"title":"Untyped"}');
        });

        expect((await requestApp(app).get('/problem')).body).toEqual({ title: 'Missing' });
        expect(await requestApp(app).get('/untyped')).toMatchObject({ text: '{"title":"Untyped"}', body: {} });
        await expect(requestApp(app).get('/malformed')).rejects.toThrow(SyntaxError);
    });
});
