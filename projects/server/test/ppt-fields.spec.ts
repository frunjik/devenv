import { describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { pptFields } from '@shared/ppt-fields';
import { createApp } from '../src/public-api';

describe('PPT field API', () => {
    it('returns every unique field defined by the shared PPT models', async () => {
        const app = createApp(process.cwd());
        app.set('env', 'production');

        const response = await request(app).get('/ppt/fields');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ data: pptFields });
        expect(response.body.data).toHaveLength(5);
        expect(new Set(response.body.data.map((field: { id: string }) => field.id)).size)
            .toBe(response.body.data.length);
    });
});
