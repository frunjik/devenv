import essentials from './agent-essentials.json';
import testing from './agent-essentials-testing.json';

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

export const agentEssentials = essentials satisfies AgentEssentialsDocument;
export const agentEssentialsTesting = testing satisfies AgentEssentialsDocument;
