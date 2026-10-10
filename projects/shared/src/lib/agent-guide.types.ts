export type CoordinatorPhase = 'Understand' | 'Explore' | 'Make' | 'Evaluate';

export interface AgentPhaseSkill {
    name: string;
    description: string;
    steps: string[];
}

export interface CoordinatorPhaseDesign {
    purpose: string;
    capabilityOptions: string[];
    handoff: string[];
}

export interface AgentCommitProcedure {
    status: string;
    source: string;
    trigger: string;
    steps: string[];
    boundaries: string[];
}

export interface AgentPractice {
    name: string;
    source: string;
    trigger: string;
    phases: Record<Exclude<CoordinatorPhase, 'Understand'>, string>;
    handoff: string[];
}

export interface AgentWorkIntent {
    status: string;
    purpose: string;
    sourceSections: string[];
    phases: Record<CoordinatorPhase, string>;
    measurementQuestions: string[];
    boundaries: string[];
}

export interface AgentPhaseGuide {
    name: string;
    status: string;
    recordedOn: string;
    purpose: string;
    phases: Record<CoordinatorPhase, CoordinatorPhaseDesign>;
    coordinatorResponsibilities: string[];
    switchingPolicy: string[];
    commitProcedure: AgentCommitProcedure;
    workIntent: AgentWorkIntent;
    practices: {
        tdd: AgentPractice;
    };
    verification: string;
    openQuestions: string[];
}

export interface AgentEssentialsSection {
    level: number;
    heading: string;
    body: string[];
}

export interface AgentEssentialsDocument {
    title: string;
    introduction: string[];
    sections: AgentEssentialsSection[];
}

export interface AgentGuideSources {
    guide: AgentPhaseGuide;
    phaseSkills: Record<CoordinatorPhase, AgentPhaseSkill>;
    essentials: AgentEssentialsDocument;
    testing: AgentEssentialsDocument;
}

export interface GeneratedAgentFile {
    path: string;
    content: string;
}

export interface AgentGuidePreview {
    guide: AgentPhaseGuide;
    sourceJson: string;
    files: GeneratedAgentFile[];
    limitations: string[];
}
