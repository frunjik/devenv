import { describe, expect, it } from '@jest/globals';
import { estimateCopilotCredits } from './copilot-credit-estimator';

describe('estimateCopilotCredits', () => {
    it('estimates published pricing for Claude Sonnet 5.5 usage', () => {
        expect(estimateCopilotCredits([{
            model: 'claude-sonnet-5.5',
            uncachedInputTokens: 1_000_000,
            outputTokens: 1_000_000,
            cacheReadTokens: 0,
            cacheWriteTokens: 0,
        }])).toEqual([{
            model: 'Claude Sonnet 5.5',
            callCount: 1,
            usdCost: 12,
            aiCredits: 1200,
        }]);
    });

    it('prices cached input and cache writes from the dated model snapshot', () => {
        expect(estimateCopilotCredits([{
            model: 'gpt-5.6-luna',
            uncachedInputTokens: 1000,
            outputTokens: 2000,
            cacheReadTokens: 500,
            cacheWriteTokens: 100,
        }])).toEqual([{
            model: 'GPT-5.6 Luna',
            callCount: 1,
            usdCost: 0.002635,
            aiCredits: 0.2635,
        }]);
    });

    it('selects the published default and long-context rates at the token threshold', () => {
        const defaultTier = estimateCopilotCredits([{
            model: 'gpt-5.4',
            uncachedInputTokens: 272000,
            outputTokens: 0,
        }]);
        const longContextTier = estimateCopilotCredits([{
            model: 'gpt-5.4',
            uncachedInputTokens: 272001,
            outputTokens: 0,
        }]);

        expect(defaultTier[0].usdCost).toBe(0.68);
        expect(longContextTier[0].usdCost).toBe(1.360005);
    });

    it('combines calls for the same model in the per-model breakdown', () => {
        expect(estimateCopilotCredits([
            { model: 'GPT-5.4', uncachedInputTokens: 1_000_000, outputTokens: 0 },
            { model: 'gpt-5.4', uncachedInputTokens: 1_000_000, outputTokens: 0 },
        ])).toEqual([{
            model: 'GPT-5.4',
            callCount: 2,
            usdCost: 10,
            aiCredits: 1000,
        }]);
    });

    it('rejects token totals that cannot be compared exactly with pricing thresholds', () => {
        expect(() => estimateCopilotCredits([{
            model: 'gpt-5.4',
            uncachedInputTokens: Number.MAX_SAFE_INTEGER,
            outputTokens: 0,
            cacheReadTokens: 1,
        }])).toThrow('Total prompt tokens exceed the safe integer range.');
    });

    it.each([
        null,
        {},
        [],
    ])('rejects usage data that is not a non-empty array', value => {
        expect(() => estimateCopilotCredits(value)).toThrow('Usage data must be a non-empty array.');
    });

    it.each([
        null,
        { model: 'gpt-5.4', uncachedInputTokens: '10', outputTokens: 2 },
        { model: 'gpt-5.4', uncachedInputTokens: 10, outputTokens: -2 },
        { model: 'gpt-5.4', uncachedInputTokens: 10, outputTokens: 2.5 },
        { model: 42, uncachedInputTokens: 10, outputTokens: 2 },
        { model: ' ', uncachedInputTokens: 10, outputTokens: 2 },
        { model: 'gpt-5.4', uncachedInputTokens: 10, outputTokens: 2, cacheReadTokens: null },
        { model: 'gpt-5.4', uncachedInputTokens: Number.MAX_SAFE_INTEGER + 1, outputTokens: 2 },
    ])('rejects malformed token usage entries', value => {
        expect(() => estimateCopilotCredits([value])).toThrow();
    });

    it('rejects model names without a matching pricing row', () => {
        expect(() => estimateCopilotCredits([{
            model: 'unknown-model',
            uncachedInputTokens: 100,
            outputTokens: 10,
        }])).toThrow('No pricing snapshot is available for model "unknown-model".');
    });

    it('rejects cache writes for a model without a published cache-write rate', () => {
        expect(() => estimateCopilotCredits([{
            model: 'gpt-5.4',
            uncachedInputTokens: 100,
            outputTokens: 10,
            cacheWriteTokens: 1,
        }])).toThrow('Cache writes are not priced for model "gpt-5.4".');
    });

    it('matches model aliases and treats omitted cache counts as unavailable input', () => {
        expect(estimateCopilotCredits([{
            model: 'claude-opus-4.8-fast',
            uncachedInputTokens: 1_000_000,
            outputTokens: 0,
        }])).toEqual([{
            model: 'Claude Opus 4.8 (fast mode) (preview)',
            callCount: 1,
            usdCost: 10,
            aiCredits: 1000,
        }]);
    });
});
