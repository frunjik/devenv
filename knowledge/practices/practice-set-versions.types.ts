import registry from './practice-set-versions.json';

export interface PracticeSetVersion {
    version: number;
    summary: string;
    sourceCommit: string;
    activatedAt: string | null;
    deactivatedAt: string | null;
    activationEvidence: string | null;
    deactivationEvidence: string | null;
}

export type PracticeCustomizationKind = 'agent' | 'skill';

export interface PracticeCustomizationVersion {
    kind: PracticeCustomizationKind;
    path: string;
    version: number;
    summary: string;
    sourceCommit: string;
}

export const practiceSetVersionRegistry = registry satisfies {
    title: string;
    scope: string;
    versioningPolicy: string;
    latestVersion: number;
    activeVersion: number | null;
    asOf: string | null;
    versions: PracticeSetVersion[];
    customizations: Array<Omit<PracticeCustomizationVersion, 'kind'> & { kind: string }>;
};
