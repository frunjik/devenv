export type WorkflowWorkPurpose = 'Product work' | 'Meta work';

export interface WorkflowTodoList {
    workflows: {
        name: string;
        primaryWorkPurpose: WorkflowWorkPurpose;
        status: string;
        resumeLabel: string;
        resumePath: string;
        relatedConcern: string;
    }[];
}
