import { describe, expect, it } from '@jest/globals';
import * as shared from '@shared';
import sharedPackage from '../../shared/package.json';

describe('Shared runtime compatibility', () => {
    it('validates diagram documents through the public API in Node', () => {
        const document = { schemaVersion: 1, title: '', elements: [], connections: [] };

        expect(shared.validateDiagramDocument(document)).toEqual(document);
    });

    it('does not export the Angular scaffold or require Angular runtime peers', () => {
        expect(shared).not.toHaveProperty('SharedComponent');
        expect(shared).not.toHaveProperty('SharedService');
        expect(sharedPackage).not.toHaveProperty('peerDependencies');
    });
});
