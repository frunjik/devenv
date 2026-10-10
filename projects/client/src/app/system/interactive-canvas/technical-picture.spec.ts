import { afterEach, describe, expect, it, jest } from '@jest/globals';
// Source-consistency check: the bundled architecture source must stay valid for the picture.
import architecture from './devenv-c4.json';
import type { TechnicalPicture } from './technical-picture';

function pictureWith(source: unknown): TechnicalPicture {
    let picture: TechnicalPicture | undefined;
    jest.isolateModules(() => {
        jest.doMock('./devenv-c4.json', () => source);
        picture = jest.requireActual<typeof import('./technical-picture')>('./technical-picture').createTechnicalPicture();
    });
    if (!picture) {
        throw new Error('Technical picture was not created.');
    }
    return picture;
}

afterEach(() => { jest.dontMock('./devenv-c4.json'); });

describe('technical picture architecture boundary', () => {
    it('accepts opposite directed relationships without imposing undirected document rules', () => {
        const source = {
            ...architecture,
            relationships: {
                ...architecture.relationships,
                reverse: { from: 'api', to: 'client', label: 'Responds with data' },
            },
            views: architecture.views.map(view => ({
                ...view,
                relationships: view.title === 'Deployment: local development'
                    ? [...view.relationships, 'reverse'] : view.relationships,
            })),
        };
        expect(() => pictureWith(source)).not.toThrow();
    });

    it('rejects a missing local development view', () => {
        expect(() => pictureWith({ ...architecture, views: [] })).toThrow('local development view is missing');
    });

    it('rejects a missing layout element', () => {
        const { api, ...elements } = architecture.elements;
        expect(() => pictureWith({ ...architecture, elements })).toThrow('unknown element api');
    });

    it('rejects unknown relationships', () => {
        expect(() => pictureWith({ ...architecture, relationships: {} })).toThrow('unknown relationship use-client');
    });

    it.each([
        { from: 'user', to: 'missing', label: 'Unknown destination' },
        { from: 'user', to: 'user', label: 'Self reference' },
    ])('rejects invalid endpoints for a directed relationship', relationship => {
        expect(() => pictureWith({
            ...architecture,
            relationships: { ...architecture.relationships, 'use-client': relationship },
        })).toThrow('invalid directed relationship use-client');
    });

    it('rejects repeated relationships in a view', () => {
        expect(() => pictureWith({
            ...architecture,
            views: architecture.views.map(view => ({
                ...view, relationships: [...view.relationships, view.relationships[0]],
            })),
        })).toThrow('duplicate directed relationship');
    });

    it.each([{ elements: [] }, { elements: ['missing'] }])('rejects invalid boundary membership %j', ({ elements }) => {
        expect(() => pictureWith({
            ...architecture,
            views: architecture.views.map(view => ({
                ...view,
                groups: [...view.groups, { title: 'Invalid boundary', elements }],
            })),
        })).toThrow('invalid boundary Invalid boundary');
    });
});
