import process from './portable-commit-process.json';

export interface CommitProcessConfiguration {
    branchNamespace: string;
    topicIdPattern: string;
    descriptionPattern: string;
    branchTemplate: string;
    idSource: string;
    newBranchBase: string;
    commitInitiation: string;
    messageApproval: boolean;
    messageStyle: string;
    attribution: string;
    remote: string;
    pushApproval: string;
}

export const portableCommitProcess = process satisfies {
    title: string;
    status: string;
    configuration: CommitProcessConfiguration;
    procedure: string[];
    interactiveSetup: string[];
    examples: string[];
    boundaries: string[];
};
