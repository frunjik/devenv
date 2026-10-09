import { describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { SharedService } from '@shared';

describe('SharedService', () => {
    it('is available as a singleton through Angular dependency injection', () => {
        TestBed.configureTestingModule({});

        const service = TestBed.inject(SharedService);

        expect(service).toBeInstanceOf(SharedService);
        expect(TestBed.inject(SharedService)).toBe(service);
    });
});
