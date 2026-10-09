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

export const practiceSetVersionRegistry = registry satisfies {
    title: string;
    scope: string;
    versioningPolicy: string;
    latestVersion: number;
    activeVersion: number | null;
    asOf: string | null;
    versions: PracticeSetVersion[];
};
