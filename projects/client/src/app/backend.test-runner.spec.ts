import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { BackendService } from './backend.service';
import { LoggerService } from './logger.service';

describe('BackendService test runner', () => {
    let service: BackendService;
    let fetchMock: jest.MockedFunction<typeof fetch>;
    const browserWindow = window as Window & { host?: string };
    const originalFetch = globalThis.fetch;

    beforeEach(() => {
        fetchMock = jest.fn<typeof fetch>();
        Object.defineProperty(globalThis, 'fetch', {
            configurable: true,
            value: fetchMock,
        });
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                {
                    provide: LoggerService,
                    useValue: { error: (_message: string, _error: Error) => undefined },
                },
            ],
        });
        service = TestBed.inject(BackendService);
        browserWindow.host = 'http://localhost:3000/';
    });

    afterEach(() => {
        delete browserWindow.host;
        Object.defineProperty(globalThis, 'fetch', {
            configurable: true,
            value: originalFetch,
        });
    });

    it('posts to the test-run endpoint and streams output chunks', async () => {
        const encoded = [
            new TextEncoder().encode('{"type":"stdout","data":"All tests "}\n{"type":"stdout","data":'),
            new TextEncoder().encode('"passed"}\n{"type":"complete","exitCode":0}\n'),
        ];
        let chunkIndex = 0;
        fetchMock.mockResolvedValue({
            ok: true,
            body: {
                getReader: () => ({
                    read: async () => {
                        if (chunkIndex === encoded.length) {
                            return { done: true, value: undefined };
                        }
                        return { done: false, value: encoded[chunkIndex++] };
                    },
                }),
            },
        } as Response);
        const chunks: string[] = [];

        await expect(service.runTests((_stream, chunk) => chunks.push(chunk))).resolves.toBe(0);

        expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/tests/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{}',
        });
        expect(chunks).toEqual(['All tests ', 'passed']);
    });

    it('reports streamed test failures', async () => {
        const encoded = new TextEncoder().encode('{"type":"error","message":"npm could not start"}\n');
        fetchMock.mockResolvedValue({
            ok: true,
            body: {
                getReader: () => ({
                    read: async () => ({ done: false, value: encoded }),
                }),
            },
        } as Response);

        await expect(service.runTests(() => undefined)).rejects.toThrow('npm could not start');
    });

    it('reports HTTP errors returned before streaming starts', async () => {
        fetchMock.mockResolvedValue({
            ok: false,
            status: 409,
            statusText: 'Conflict',
            url: 'http://localhost:3000/tests/run',
            text: async () => '{"error":{"message":"Tests are already running"}}',
        } as Response);

        await expect(service.runTests(() => undefined)).rejects.toMatchObject({
            status: 409,
            error: { error: { message: 'Tests are already running' } },
        });
    });

    it('preserves plain-text HTTP error responses', async () => {
        fetchMock.mockResolvedValue({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            url: 'http://localhost:3000/tests/run',
            text: async () => 'server unavailable',
        } as Response);

        await expect(service.runTests(() => undefined)).rejects.toMatchObject({
            error: 'server unavailable',
        });
    });

    it('reports a missing response stream', async () => {
        fetchMock.mockResolvedValue({ ok: true, body: null } as Response);

        await expect(service.runTests(() => undefined))
            .rejects.toThrow('The server did not provide a test output stream');
    });

    it('rejects malformed stream events', async () => {
        const encoded = new TextEncoder().encode('not-json\n');
        fetchMock.mockResolvedValue({
            ok: true,
            body: {
                getReader: () => ({
                    read: async () => ({ done: false, value: encoded }),
                }),
            },
        } as Response);

        await expect(service.runTests(() => undefined)).rejects.toThrow();
    });

    it('rejects stream events with an unsupported shape', async () => {
        const encoded = new TextEncoder().encode('{"type":"unknown"}\n');
        fetchMock.mockResolvedValue({
            ok: true,
            body: {
                getReader: () => ({
                    read: async () => ({ done: false, value: encoded }),
                }),
            },
        } as Response);

        await expect(service.runTests(() => undefined))
            .rejects.toThrow('The server sent an invalid test output event');
    });

    it('rejects a stream that ends without an exit code', async () => {
        const encoded = new TextEncoder().encode('{"type":"stdout","data":"partial"}\n');
        let sent = false;
        fetchMock.mockResolvedValue({
            ok: true,
            body: {
                getReader: () => ({
                    read: async () => {
                        if (sent) {
                            return { done: true, value: undefined };
                        }
                        sent = true;
                        return { done: false, value: encoded };
                    },
                }),
            },
        } as Response);

        await expect(service.runTests(() => undefined))
            .rejects.toThrow('The test output stream ended before the run completed');
    });
});
