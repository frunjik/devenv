import { beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { FeatureWorkService } from './feature-work.service';

describe('FeatureWorkService', () => {
    let service: FeatureWorkService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FeatureWorkService);
    });

    it('tracks the feature selected to work on', () => {
        service.start('feature-id', 'Add a feature');

        expect(service.activeFeature).toEqual({
            id: 'feature-id',
            description: 'Add a feature',
        });
    });

    it('clears the active feature only when the matching feature completes', () => {
        service.start('feature-id', 'Add a feature');

        service.complete('another-feature');
        expect(service.activeFeature?.id).toBe('feature-id');

        service.complete('feature-id');
        expect(service.activeFeature).toBeNull();
    });
});
