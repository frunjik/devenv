import { describe, expect, it } from '@jest/globals';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
    it('logs an error through its public API', () => {
        const logger = new LoggerService();

        expect(logger.error('request failed', new Error('offline'))).toBeUndefined();
    });
});
