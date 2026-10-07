import checklist from './portable-practices-checklist.json';

export interface TodoList {
    title: string;
    status: string;
    purpose: string;
    sections: {
        title: string;
        items: {
            done: boolean;
            text: string;
        }[];
    }[];
    review: {
        sources: string[];
        added: string;
        limits: string;
        compression: string;
    };
    checkpoint: {
        decisions: string;
        openQuestions: string;
        nextStep: string;
    };
}

export const portablePracticesChecklist = checklist satisfies TodoList;
