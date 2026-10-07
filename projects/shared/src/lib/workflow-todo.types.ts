export interface WorkflowTodoList {
    workflows: {
        name: string;
        status: string;
        resumeLabel: string;
        resumePath: string;
        relatedConcern: string;
    }[];
}
