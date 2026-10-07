import { describe, expect, it, jest } from '@jest/globals';
import { writeGlossaryJson } from '../../../scripts/glossary-export';

describe('Glossary JSON export', () => {
    it('writes structured records from the specified Glossary source', () => {
        const source = [
            'Term',
            '- A definition.',
            '- Example: An example.',
            '- Domains: DevEnv, Meta',
            '',
            'Unknown usage',
        ].join('\n');
        const filesystem = {
            readFileSync: jest.fn(() => source),
            writeFileSync: jest.fn(),
        };

        writeGlossaryJson('.glossary', 'design/glossary-export.generated.json', filesystem);

        expect(filesystem.readFileSync).toHaveBeenCalledWith('.glossary', 'utf8');
        expect(filesystem.writeFileSync).toHaveBeenCalledWith(
            'design/glossary-export.generated.json',
            `${JSON.stringify([
                { term: 'Term', definitions: ['A definition.'], examples: ['An example.'], domains: ['DevEnv', 'Meta'] },
                { term: 'Unknown usage', definitions: [], examples: [], domains: [] },
            ], null, 2)}\n`,
            'utf8',
        );
    });

    it('does not write when Glossary metadata is invalid', () => {
        const filesystem = {
            readFileSync: jest.fn(() => 'Term\n- Domains: Meta, '),
            writeFileSync: jest.fn(),
        };

        expect(() => writeGlossaryJson('.glossary', 'output.json', filesystem))
            .toThrow('Usage Domains must contain non-empty labels');
        expect(filesystem.writeFileSync).not.toHaveBeenCalled();
    });

    it('surfaces file read and write failures', () => {
        const failure = new Error('Filesystem failed');
        expect(() => writeGlossaryJson('.glossary', 'output.json', {
            readFileSync: () => { throw failure; },
            writeFileSync: jest.fn(),
        })).toThrow(failure);
        expect(() => writeGlossaryJson('.glossary', 'output.json', {
            readFileSync: () => 'Term',
            writeFileSync: () => { throw failure; },
        })).toThrow(failure);
    });
});
