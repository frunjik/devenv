import guide from './agent-phase-guide.json';

export type CoordinatorPhase = 'Understand' | 'Explore' | 'Make' | 'Evaluate';

export interface CoordinatorPhaseDesign {
    purpose: string;
    capabilityOptions: string[];
    handoff: string[];
}

export interface AgentPhaseGuide {
    name: string;
    status: string;
    recordedOn: string;
    purpose: string;
    phases: Record<CoordinatorPhase, CoordinatorPhaseDesign>;
    coordinatorResponsibilities: string[];
    switchingPolicy: string[];
    verification: string;
    openQuestions: string[];
}

export const agentPhaseGuide = guide satisfies AgentPhaseGuide;
