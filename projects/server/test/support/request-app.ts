import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';

export type RequestListener = (request: IncomingMessage, response: ServerResponse) => void;

const JSON_MEDIA_TYPE = /^application\/([\w.-]+\+)?json\s*(;|$)/i;

export interface AppResponse {
    status: number;
    headers: Record<string, string>;
    text: string;
    // Matches supertest's untyped parsed body so migrated specs keep their property access.
    body: any;
}

export class AppRequest implements PromiseLike<AppResponse> {
    private readonly headers: Record<string, string> = {};
    private readonly searchParams = new URLSearchParams();
    private payload: { data: string; defaultType: string } | undefined;

    constructor(
        private readonly app: RequestListener,
        private readonly method: string,
        private readonly path: string,
    ) {}

    query(values: Record<string, string | number | boolean>): this {
        for (const [name, value] of Object.entries(values)) {
            this.searchParams.append(name, String(value));
        }
        return this;
    }

    set(name: string, value: string): this {
        this.headers[name.toLowerCase()] = value;
        return this;
    }

    // Mirrors supertest: objects are JSON, bare strings default to a form body.
    send(data: string | object): this {
        this.payload = typeof data === 'string'
            ? { data, defaultType: 'application/x-www-form-urlencoded' }
            : { data: JSON.stringify(data), defaultType: 'application/json' };
        return this;
    }

    then<TResult1 = AppResponse, TResult2 = never>(
        onfulfilled?: ((value: AppResponse) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ): Promise<TResult1 | TResult2> {
        return this.execute().then(onfulfilled, onrejected);
    }

    private execute(): Promise<AppResponse> {
        // An unconnected socket performs no I/O; it only satisfies consumers of request.socket.
        const request = new IncomingMessage(new Socket());
        const query = this.searchParams.toString();
        request.method = this.method;
        request.url = query ? `${this.path}?${query}` : this.path;
        request.headers = { ...this.headers };
        if (this.payload) {
            request.headers['content-type'] ??= this.payload.defaultType;
            request.headers['content-length'] = String(Buffer.byteLength(this.payload.data));
            request.push(this.payload.data);
        }
        request.push(null);

        const response = new ServerResponse(request);
        const chunks: Buffer[] = [];
        const collect = (chunk: unknown, encoding: unknown) => {
            if (!response.headersSent) {
                response.writeHead(response.statusCode);
            }
            if (chunk !== undefined) {
                chunks.push(typeof chunk === 'string'
                    ? Buffer.from(chunk, typeof encoding === 'string' ? encoding as BufferEncoding : 'utf8')
                    : Buffer.from(chunk as Uint8Array));
            }
        };

        return new Promise((resolve, reject) => {
            // Capture output in memory instead of writing to the unconnected socket.
            response.write = ((chunk: unknown, encoding?: unknown) => {
                collect(chunk, encoding);
                return true;
            }) as ServerResponse['write'];
            response.end = ((chunk?: unknown, encoding?: unknown) => {
                collect(chunk, encoding);
                response.emit('finish');
                const text = Buffer.concat(chunks).toString('utf8');
                const headers = Object.fromEntries(Object.entries(response.getHeaders())
                    .map(([name, value]) => [name, String(value)]));
                try {
                    resolve({
                        status: response.statusCode,
                        headers,
                        text,
                        body: text && JSON_MEDIA_TYPE.test(headers['content-type'] ?? '') ? JSON.parse(text) : {},
                    });
                } catch (error) {
                    // Reject here; a throw inside end() would be swallowed by Express and hang the request.
                    reject(error);
                }
                return response;
            }) as ServerResponse['end'];
            this.app(request, response);
        });
    }
}

export function requestApp(app: RequestListener) {
    return {
        get: (path: string) => new AppRequest(app, 'GET', path),
        post: (path: string) => new AppRequest(app, 'POST', path),
    };
}
