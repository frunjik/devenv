import guide from './agent-phase-guide.json';
import skills from './agent-phase-skills.json';

export type CoordinatorPhase = 'Understand' | 'Explore' | 'Make' | 'Evaluate';

export interface AgentPhaseSkill {
    name: string;
    description: string;
    steps: string[];
}

export const agentPhaseSkills = skills satisfies Record<CoordinatorPhase, AgentPhaseSkill>;

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

export interface AgentPhaseGuide {
    name: string;
    status: string;
    recordedOn: string;
    purpose: string;
    phases: Record<CoordinatorPhase, CoordinatorPhaseDesign>;
    coordinatorResponsibilities: string[];
    switchingPolicy: string[];
    commitProcedure: AgentCommitProcedure;
    practices: {
        tdd: AgentPractice;
    };
    verification: string;
    openQuestions: string[];
}

export const agentPhaseGuide = guide satisfies AgentPhaseGuide;
