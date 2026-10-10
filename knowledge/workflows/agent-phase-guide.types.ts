import guide from './agent-phase-guide.json';
import skills from './agent-phase-skills.json';
import type { AgentPhaseGuide, AgentPhaseSkill, CoordinatorPhase } from '@shared';
export type {
    AgentPhaseGuide, AgentPhaseSkill, CoordinatorPhase, CoordinatorPhaseDesign,
    AgentCommitProcedure, AgentPractice, AgentWorkIntent,
} from '@shared';

export const agentPhaseSkills = skills satisfies Record<CoordinatorPhase, AgentPhaseSkill>;

export const agentPhaseGuide = guide satisfies AgentPhaseGuide;
