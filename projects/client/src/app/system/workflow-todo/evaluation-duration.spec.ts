import { describe, expect, it } from '@jest/globals';
import { formatElapsedDuration, formatSummedElapsedDuration } from './evaluation-duration';

describe('evaluation elapsed durations', () => {
    const start = '2026-10-10T00:00:00Z';

    it('sums exact milliseconds before rounding to seconds', () => {
        expect(formatSummedElapsedDuration([
            { startedAt: start, completedAt: '2026-10-10T01:00:00.600Z' },
            { startedAt: start, completedAt: '2026-10-10T00:00:00.600Z' },
        ])).toBe('01h 00m 01s');
    });

    it('counts missing completed durations separately and excludes incomplete work', () => {
        expect(formatSummedElapsedDuration([
            { startedAt: start, completedAt: '2026-10-10T00:02:00Z' },
            { startedAt: null, completedAt: start },
            { startedAt: start, completedAt: null },
        ])).toBe('02m 00s; 1 unknown');
    });

    it('does not present all-unknown durations as zero', () => {
        expect(formatSummedElapsedDuration([{ startedAt: null, completedAt: start }])).toBe('Unknown; 1 unknown');
    });

    it('counts invalid and reversed timestamps as unavailable', () => {
        expect(formatSummedElapsedDuration([
            { startedAt: 'invalid', completedAt: start },
            { startedAt: start, completedAt: 'invalid' },
            { startedAt: '2026-10-10T00:01:00Z', completedAt: start },
        ])).toBe('Unavailable; 3 unavailable');
    });

    it('reports unknown and unavailable entries alongside a known zero duration', () => {
        expect(formatSummedElapsedDuration([
            { startedAt: start, completedAt: start },
            { startedAt: null, completedAt: start },
            { startedAt: start, completedAt: 'invalid' },
        ])).toBe('00m 00s; 1 unknown; 1 unavailable');
    });

    it('shows no total when there are no completed evaluations', () => {
        expect(formatSummedElapsedDuration([])).toBe('—');
        expect(formatSummedElapsedDuration([{ startedAt: start, completedAt: null }])).toBe('—');
    });

    it.each([
        [null, start, 'Unknown'],
        [start, null, 'Unknown'],
        ['invalid', start, 'Unavailable (invalid timestamp)'],
        [start, 'invalid', 'Unavailable (invalid timestamp)'],
        ['2026-10-10T00:01:00Z', start, 'Unavailable (completion precedes start)'],
        [start, start, '00m 00s'],
        [start, '2026-10-10T00:02:03Z', '02m 03s'],
        [start, '2026-10-10T01:02:03Z', '01h 02m 03s'],
        [start, '2026-10-10T10:12:13Z', '10h 12m 13s'],
        [start, '2026-10-14T04:00:00Z', '100h 00m 00s'],
    ])('formats individual duration for %s to %s', (from, to, expected) => {
        expect(formatElapsedDuration(from, to)).toBe(expected);
    });
});
