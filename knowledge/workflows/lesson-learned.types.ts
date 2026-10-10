import lessons from './darwin-lessons.json';

export interface LessonLearned {
    id: string;
    recordedOn: string;
    context: string;
    intent: string;
    evidence: string[];
    recommendation: string;
    verification: string;
    openQuestions: string[];
}

export const darwinLessons = lessons satisfies LessonLearned[];
