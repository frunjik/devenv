import ledger from './ruleset-review.json';

export interface PracticeReviewDecision {
    id: number;
    summary: string;
    sources: string[];
    category: string;
    order: number | null;
    disposition: string;
    rationale: string | null;
}

export interface PracticeReviewLedger {
    title: string;
    status: string;
    scope: string;
    budget: {
        maximumNonEmptyAlwaysOnLines: number;
        includesMandatoryReferences: boolean;
    };
    categoryMeanings: {
        must: string;
        should: string;
        could: string;
        wont: string;
    };
    preservationPolicy: string;
    orderingPolicy: string;
    decisions: PracticeReviewDecision[];
    approvedMerges: {
        decisionIds: number[];
        text: string;
    }[];
    clarifications: string[];
    openQuestions: string[];
}

export const rulesetReviewLedger = ledger satisfies PracticeReviewLedger;
