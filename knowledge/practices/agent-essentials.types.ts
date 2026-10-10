import essentials from './agent-essentials.json';
import testing from './agent-essentials-testing.json';
import type { AgentEssentialsDocument } from '@shared';
export type { AgentEssentialsDocument, AgentEssentialsSection } from '@shared';

export const agentEssentials = essentials satisfies AgentEssentialsDocument;
export const agentEssentialsTesting = testing satisfies AgentEssentialsDocument;
