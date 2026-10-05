import { describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../src/public-api';

describe('PPT field API', () => {
    it('returns an empty list of fields', async () => {
        const app = createApp(process.cwd());
        app.set('env', 'production');

        const response = await request(app).get('/ppt/fields');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ data: [] });
    });
});
