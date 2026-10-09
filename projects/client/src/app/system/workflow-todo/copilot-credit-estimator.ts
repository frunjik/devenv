export interface CopilotTokenUsage {
    model: string;
    uncachedInputTokens: number;
    outputTokens: number;
    cacheReadTokens?: number;
    cacheWriteTokens?: number;
}

export interface CopilotModelPricing {
    model: string;
    minInputTokens: number;
    maxInputTokens: number | null;
    inputUsdPerMillion: number;
    cacheReadUsdPerMillion: number;
    cacheWriteUsdPerMillion: number | null;
    outputUsdPerMillion: number;
    modelAliases?: string[];
}

export interface CopilotCreditEstimate {
    model: string;
    callCount: number;
    usdCost: number;
    aiCredits: number;
}

const pricingSnapshot: CopilotModelPricing[] = [
    { model: 'GPT-5 mini', minInputTokens: 0, maxInputTokens: null, inputUsdPerMillion: 0.25, cacheReadUsdPerMillion: 0.025, cacheWriteUsdPerMillion: null, outputUsdPerMillion: 2 },
    { model: 'GPT-5.3-Codex', minInputTokens: 0, maxInputTokens: null, inputUsdPerMillion: 1.75, cacheReadUsdPerMillion: 0.175, cacheWriteUsdPerMillion: null, outputUsdPerMillion: 14 },
    { model: 'GPT-5.4', minInputTokens: 0, maxInputTokens: 272000, inputUsdPerMillion: 2.5, cacheReadUsdPerMillion: 0.25, cacheWriteUsdPerMillion: null, outputUsdPerMillion: 15 },
    { model: 'GPT-5.4', minInputTokens: 272001, maxInputTokens: null, inputUsdPerMillion: 5, cacheReadUsdPerMillion: 0.5, cacheWriteUsdPerMillion: null, outputUsdPerMillion: 22.5 },
    { model: 'GPT-5.4 mini', minInputTokens: 0, maxInputTokens: null, inputUsdPerMillion: 0.75, cacheReadUsdPerMillion: 0.075, cacheWriteUsdPerMillion: null, outputUsdPerMillion: 4.5 },
    { model: 'GPT-5.4 nano', minInputTokens: 0, maxInputTokens: null, inputUsdPerMillion: 0.2, cacheReadUsdPerMillion: 0.02, cacheWriteUsdPerMillion: null, outputUsdPerMillion: 1.25 },
    { model: 'GPT-5.5', minInputTokens: 0, maxInputTokens: 272000, inputUsdPerMillion: 5, cacheReadUsdPerMillion: 0.5, cacheWriteUsdPerMillion: null, outputUsdPerMillion: 30 },
    { model: 'GPT-5.5', minInputTokens: 272001, maxInputTokens: null, inputUsdPerMillion: 10, cacheReadUsdPerMillion: 1, cacheWriteUsdPerMillion: null, outputUsdPerMillion: 45 },
    { model: 'GPT-5.6 Luna', minInputTokens: 0, maxInputTokens: 200000, inputUsdPerMillion: 0.2, cacheReadUsdPerMillion: 0.02, cacheWriteUsdPerMillion: 0.25, outputUsdPerMillion: 1.2 },
    { model: 'GPT-5.6 Luna', minInputTokens: 200001, maxInputTokens: null, inputUsdPerMillion: 0.4, cacheReadUsdPerMillion: 0.04, cacheWriteUsdPerMillion: 0.5, outputUsdPerMillion: 1.8 },
    { model: 'GPT-5.6 Sol', minInputTokens: 0, maxInputTokens: 272000, inputUsdPerMillion: 4, cacheReadUsdPerMillion: 0.4, cacheWriteUsdPerMillion: 5, outputUsdPerMillion: 20 },
    { model: 'GPT-5.6 Sol', minInputTokens: 272001, maxInputTokens: null, inputUsdPerMillion: 8, cacheReadUsdPerMillion: 0.8, cacheWriteUsdPerMillion: 10, outputUsdPerMillion: 30 },
    { model: 'GPT-5.6 Terra', minInputTokens: 0, maxInputTokens: 272000, inputUsdPerMillion: 2, cacheReadUsdPerMillion: 0.2, cacheWriteUsdPerMillion: 2.5, outputUsdPerMillion: 12 },
    { model: 'GPT-5.6 Terra', minInputTokens: 272001, maxInputTokens: null, inputUsdPerMillion: 4, cacheReadUsdPerMillion: 0.4, cacheWriteUsdPerMillion: 5, outputUsdPerMillion: 18 },
    { model: 'GPT-6 Astra', minInputTokens: 0, maxInputTokens: 272000, inputUsdPerMillion: 10, cacheReadUsdPerMillion: 1, cacheWriteUsdPerMillion: 12.5, outputUsdPerMillion: 50 },
    { model: 'GPT-6 Astra', minInputTokens: 272001, maxInputTokens: null, inputUsdPerMillion: 20, cacheReadUsdPerMillion: 2, cacheWriteUsdPerMillion: 25, outputUsdPerMillion: 75 },
    { model: 'GPT-6 Luna', minInputTokens: 0, maxInputTokens: 272000, inputUsdPerMillion: 0.1, cacheReadUsdPerMillion: 0.01, cacheWriteUsdPerMillion: 0.125, outputUsdPerMillion: 0.5 },
    { model: 'GPT-6 Luna', minInputTokens: 272001, maxInputTokens: null, inputUsdPerMillion: 0.2, cacheReadUsdPerMillion: 0.02, cacheWriteUsdPerMillion: 0.25, outputUsdPerMillion: 0.75 },
    { model: 'GPT-6 Sol', minInputTokens: 0, maxInputTokens: 272000, inputUsdPerMillion: 2, cacheReadUsdPerMillion: 0.2, cacheWriteUsdPerMillion: 2.5, outputUsdPerMillion: 10 },
    { model: 'GPT-6 Sol', minInputTokens: 272001, maxInputTokens: null, inputUsdPerMillion: 4, cacheReadUsdPerMillion: 0.4, cacheWriteUsdPerMillion: 5, outputUsdPerMillion: 15 },
    { model: 'GPT-6.1 Sol', minInputTokens: 0, maxInputTokens: 272000, inputUsdPerMillion: 2, cacheReadUsdPerMillion: 0.1, cacheWriteUsdPerMillion: 2.5, outputUsdPerMillion: 10 },
    { model: 'GPT-6.1 Sol', minInputTokens: 272001, maxInputTokens: null, inputUsdPerMillion: 4, cacheReadUsdPerMillion: 0.2, cacheWriteUsdPerMillion: 5, outputUsdPerMillion: 15 },
    { model: 'Claude Haiku 4.5', minInputTokens: 0, maxInputTokens: null, inputUsdPerMillion: 1, cacheReadUsdPerMillion: 0.1, cacheWriteUsdPerMillion: 1.25, outputUsdPerMillion: 5 },
    { model: 'Claude Haiku 5.5', minInputTokens: 0, maxInputTokens: 100000, inputUsdPerMillion: 0.1, cacheReadUsdPerMillion: 0.01, cacheWriteUsdPerMillion: 0.125, outputUsdPerMillion: 0.5 },
    { model: 'Claude Haiku 5.5', minInputTokens: 100001, maxInputTokens: null, inputUsdPerMillion: 0.5, cacheReadUsdPerMillion: 0.05, cacheWriteUsdPerMillion: 0.625, outputUsdPerMillion: 2.5 },
    { model: 'Claude Sonnet 4', minInputTokens: 0, maxInputTokens: null, inputUsdPerMillion: 3, cacheReadUsdPerMillion: 0.3, cacheWriteUsdPerMillion: 3.75, outputUsdPerMillion: 15 },
    { model: 'Claude Sonnet 4.6', minInputTokens: 0, maxInputTokens: null, inputUsdPerMillion: 3, cacheReadUsdPerMillion: 0.3, cacheWriteUsdPerMillion: 3.75, outputUsdPerMillion: 15 },
    { model: 'Claude Opus 4.8', minInputTokens: 0, maxInputTokens: null, inputUsdPerMillion: 5, cacheReadUsdPerMillion: 0.5, cacheWriteUsdPerMillion: 6.25, outputUsdPerMillion: 25 },
    { model: 'Claude Opus 5', minInputTokens: 0, maxInputTokens: null, inputUsdPerMillion: 5, cacheReadUsdPerMillion: 0.5, cacheWriteUsdPerMillion: 6.25, outputUsdPerMillion: 25 },
    { model: 'Claude Opus 5.5', minInputTokens: 0, maxInputTokens: null, inputUsdPerMillion: 4, cacheReadUsdPerMillion: 0.2, cacheWriteUsdPerMillion: 5, outputUsdPerMillion: 20 },
    { model: 'Claude Sonnet 5', minInputTokens: 0, maxInputTokens: null, inputUsdPerMillion: 2, cacheReadUsdPerMillion: 0.2, cacheWriteUsdPerMillion: 2.5, outputUsdPerMillion: 10 },
    { model: 'Claude Sonnet 5.5', minInputTokens: 0, maxInputTokens: null, inputUsdPerMillion: 2, cacheReadUsdPerMillion: 0.1, cacheWriteUsdPerMillion: 2.5, outputUsdPerMillion: 10 },
    {
        model: 'Claude Opus 4.8 (fast mode) (preview)',
        modelAliases: ['claude-opus-4.8-fast'],
        minInputTokens: 0,
        maxInputTokens: null,
        inputUsdPerMillion: 10,
        cacheReadUsdPerMillion: 1,
        cacheWriteUsdPerMillion: 12.5,
        outputUsdPerMillion: 50,
    },
    { model: 'Claude Fable 5', minInputTokens: 0, maxInputTokens: null, inputUsdPerMillion: 10, cacheReadUsdPerMillion: 1, cacheWriteUsdPerMillion: 12.5, outputUsdPerMillion: 50 },
    { model: 'Claude Fable 5.1', minInputTokens: 0, maxInputTokens: null, inputUsdPerMillion: 10, cacheReadUsdPerMillion: 0.25, cacheWriteUsdPerMillion: 12.5, outputUsdPerMillion: 50 },
    { model: 'Gemini 3.7 Flash', minInputTokens: 0, maxInputTokens: null, inputUsdPerMillion: 0.75, cacheReadUsdPerMillion: 0.075, cacheWriteUsdPerMillion: null, outputUsdPerMillion: 3.75 },
    { model: 'Gemini 3.8 Flash', minInputTokens: 0, maxInputTokens: null, inputUsdPerMillion: 0.75, cacheReadUsdPerMillion: 0.075, cacheWriteUsdPerMillion: null, outputUsdPerMillion: 3.75 },
    { model: 'MAI-Code-1.1-Flash', minInputTokens: 0, maxInputTokens: null, inputUsdPerMillion: 0.2, cacheReadUsdPerMillion: 0.02, cacheWriteUsdPerMillion: null, outputUsdPerMillion: 1.2 },
    { model: 'Grok 4.5', minInputTokens: 0, maxInputTokens: 200000, inputUsdPerMillion: 2, cacheReadUsdPerMillion: 0.5, cacheWriteUsdPerMillion: null, outputUsdPerMillion: 6 },
    { model: 'Grok 4.5', minInputTokens: 200001, maxInputTokens: null, inputUsdPerMillion: 4, cacheReadUsdPerMillion: 1, cacheWriteUsdPerMillion: null, outputUsdPerMillion: 12 },
    { model: 'Grok 4.6', minInputTokens: 0, maxInputTokens: 200000, inputUsdPerMillion: 2, cacheReadUsdPerMillion: 0.5, cacheWriteUsdPerMillion: null, outputUsdPerMillion: 6 },
    { model: 'Grok 4.6', minInputTokens: 200001, maxInputTokens: null, inputUsdPerMillion: 4, cacheReadUsdPerMillion: 1, cacheWriteUsdPerMillion: null, outputUsdPerMillion: 12 },
    { model: 'Grok 4.7', minInputTokens: 0, maxInputTokens: 200000, inputUsdPerMillion: 2, cacheReadUsdPerMillion: 0.5, cacheWriteUsdPerMillion: null, outputUsdPerMillion: 6 },
    { model: 'Grok 4.7', minInputTokens: 200001, maxInputTokens: null, inputUsdPerMillion: 4, cacheReadUsdPerMillion: 1, cacheWriteUsdPerMillion: null, outputUsdPerMillion: 12 },
    { model: 'Kimi K3', minInputTokens: 0, maxInputTokens: null, inputUsdPerMillion: 3, cacheReadUsdPerMillion: 0.3, cacheWriteUsdPerMillion: null, outputUsdPerMillion: 15 },
];

function requireRecord(value: unknown): Record<string, unknown> {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('Each usage entry must be an object.');
    }
    return value as Record<string, unknown>;
}

function requireTokenCount(value: unknown, field: string): number {
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
        throw new Error(`${field} must be a non-negative integer.`);
    }
    return value;
}

function optionalTokenCount(value: unknown, field: string): number {
    return value === undefined ? 0 : requireTokenCount(value, field);
}

function findPricing(model: string, promptTokens: number): CopilotModelPricing {
    const normalizedModel = model.toLowerCase().replace(/[^a-z0-9]/g, '');
    const pricing = pricingSnapshot.find(item =>
        [item.model, ...(item.modelAliases ?? [])]
            .some(name => name.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedModel)
        && promptTokens >= item.minInputTokens
        && (item.maxInputTokens === null || promptTokens <= item.maxInputTokens),
    );
    if (!pricing) {
        throw new Error(`No pricing snapshot is available for model "${model}".`);
    }
    return pricing;
}

export function estimateCopilotCredits(value: unknown): CopilotCreditEstimate[] {
    if (!Array.isArray(value) || value.length === 0) {
        throw new Error('Usage data must be a non-empty array.');
    }

    const estimates = new Map<string, CopilotCreditEstimate>();
    for (const item of value) {
        const record = requireRecord(item);
        const model = typeof record['model'] === 'string' ? record['model'].trim() : '';
        if (!model) {
            throw new Error('Each usage entry must include a model name.');
        }
        const uncachedInputTokens = requireTokenCount(record['uncachedInputTokens'], 'uncachedInputTokens');
        const outputTokens = requireTokenCount(record['outputTokens'], 'outputTokens');
        const cacheReadTokens = optionalTokenCount(record['cacheReadTokens'], 'cacheReadTokens');
        const cacheWriteTokens = optionalTokenCount(record['cacheWriteTokens'], 'cacheWriteTokens');
        const promptTokens = uncachedInputTokens + cacheReadTokens + cacheWriteTokens;
        if (!Number.isSafeInteger(promptTokens)) {
            throw new Error('Total prompt tokens exceed the safe integer range.');
        }
        const pricing = findPricing(model, promptTokens);
        if (cacheWriteTokens > 0 && pricing.cacheWriteUsdPerMillion === null) {
            throw new Error(`Cache writes are not priced for model "${model}".`);
        }

        const usdCost = (
            uncachedInputTokens * pricing.inputUsdPerMillion
            + cacheReadTokens * pricing.cacheReadUsdPerMillion
            + cacheWriteTokens * (pricing.cacheWriteUsdPerMillion ?? 0)
            + outputTokens * pricing.outputUsdPerMillion
        ) / 1_000_000;
        const current = estimates.get(pricing.model) ?? {
            model: pricing.model,
            callCount: 0,
            usdCost: 0,
            aiCredits: 0,
        };
        current.callCount += 1;
        current.usdCost += usdCost;
        current.aiCredits = current.usdCost * 100;
        estimates.set(pricing.model, current);
    }
    return [...estimates.values()];
}

export const COPILOT_CREDIT_PRICING_SOURCE =
    'https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing';
export const COPILOT_CREDIT_PRICING_AS_OF = '2026-10-09';
