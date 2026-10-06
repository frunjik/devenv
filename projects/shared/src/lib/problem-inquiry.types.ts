export type ProblemTicketId = string;
export type UserId = string;

export interface User {
    id: UserId;
    name?: string;
}

export type TicketStatus =
    | { state: 'open' }
    | { state: 'assigned'; assigneeId: UserId }
    | { state: 'resolved'; assigneeId?: UserId }
    | { state: 'closed'; assigneeId?: UserId }
    | { state: 'duplicate'; duplicateOfId: ProblemTicketId };

export type TicketCommand =
    | { kind: 'assign'; assigneeId: UserId }
    | { kind: 'unassign' }
    | { kind: 'resolve' }
    | { kind: 'close' }
    | { kind: 'reopen' }
    | { kind: 'mark-duplicate'; duplicateOfId: ProblemTicketId };

export interface TicketChangeEvent {
    kind: TicketCommand['kind'];
    actor: User;
    at: string;
    before: TicketStatus;
    after: TicketStatus;
}

export type TicketCommandResult =
    | { ok: true; status: TicketStatus; event: TicketChangeEvent }
    | { ok: false; reason: string };

export type DataKind = 'sample' | 'real';

export type NewProblemTicket = Omit<ProblemTicket, 'id'>;

export interface StoredTicket extends ProblemTicket {
    status: TicketStatus;
    version: number;
    dataKind: DataKind;
}

export type TicketChangeOutcome =
    | { ok: true; ticket: StoredTicket; event: TicketChangeEvent }
    | { ok: false; kind: 'not-found' }
    | { ok: false; kind: 'stale'; current: StoredTicket }
    | { ok: false; kind: 'refused'; reason: string };
export type ImportedNoteId = string;
export type EvidenceId = string;
export type FindingId = string;
export type AIProposalId = string;
export type InquiryId = string;

export type ScopeLevel = 'operation' | 'workflow' | 'system' | 'cross-system';

export interface ProblemScope {
    level: ScopeLevel;
    label: string;
    parent?: ProblemScope;
}

export interface WorkContext {
    people: string[];
    places: string[];
    things: string[];
    observedDuring?: {
        from: string;
        to?: string;
    };
}

export interface ProblemFrame {
    condition: string;
    affected: string;
    impact: string;
}

export interface ProblemTicket {
    id: ProblemTicketId;
    title: string;
    report: string;
    problem: ProblemFrame;
    sourceNoteIds?: ImportedNoteId[];
    scope: ProblemScope;
    context: WorkContext;
    reportedBy: string;
    reportedAt: string;
}

export type SourceOrigin =
    | 'synthetic'
    | 'external-report'
    | 'direct-observation'
    | 'system-artifact'
    | 'unknown';

export type VerificationStatus = 'unreviewed' | 'corroborated' | 'disputed' | 'unknown';

export interface SourceReference {
    artifact: string | null;
    locator: string | null;
}

export interface NoteProposal {
    sourceText: string;
    sourceReference: SourceReference;
    sourceOrigin: SourceOrigin;
    verificationStatus: VerificationStatus;
    interpretation: string;
    openQuestions: string[];
}

export interface ImportedNote {
    id: ImportedNoteId;
    proposal: NoteProposal;
    acceptedAt: string;
}

export interface ProblemSet {
    id: string;
    title: string;
    tickets: ProblemTicket[];
}

export type EvidenceSourceKind =
    | 'screen-definition'
    | 'source-code'
    | 'data'
    | 'observation'
    | 'expert-account'
    | 'test-result'
    | 'other';

export interface InquiryEvidence {
    id: EvidenceId;
    sourceKind: EvidenceSourceKind;
    source: string;
    description: string;
    ticketIds: ProblemTicketId[];
    recordedAt: string;
}

export type FindingKind = 'observation' | 'pattern' | 'contradiction' | 'unknown';

export interface InquiryFinding {
    id: FindingId;
    kind: FindingKind;
    statement: string;
    ticketIds: ProblemTicketId[];
    evidenceIds: EvidenceId[];
    confidence: 'low' | 'medium' | 'high';
}

export type AIProposalKind = 'question' | 'interpretation' | 'design' | 'code' | 'test';

export interface AIProposal {
    id: AIProposalId;
    kind: AIProposalKind;
    content: string;
    basedOnEvidenceIds: EvidenceId[];
    assumptions: string[];
    openQuestions: string[];
    reviewStatus: 'unreviewed' | 'accepted' | 'revised' | 'rejected';
}

export interface InsightResult {
    kind: 'insight';
    statement: string;
    appliesToTicketIds: ProblemTicketId[];
    findingIds: FindingId[];
    evidenceIds: EvidenceId[];
    confidence: 'low' | 'medium' | 'high';
    caveats: string[];
}

export interface TargetChangeResult {
    kind: 'target-change';
    intendedOutcome: string;
    proposedBehavior: string;
    scope: ProblemScope;
    findingIds: FindingId[];
    evidenceIds: EvidenceId[];
    acceptanceChecks: string[];
    knownDifferences: string[];
}

export type InquiryResult = InsightResult | TargetChangeResult;

export interface InquiryDecision {
    outcome: 'accepted' | 'revised' | 'rejected';
    rationale: string;
    decidedBy: string;
    decidedAt: string;
    targetReferences: string[];
}

interface InquiryBase {
    id: InquiryId;
    problemSetId: string;
    ticketIds: ProblemTicketId[];
    question: string;
    evidence: InquiryEvidence[];
    findings: InquiryFinding[];
    aiProposals: AIProposal[];
}

export type ProblemInquiry =
    | (InquiryBase & {
          status: 'investigating';
          result?: never;
          decision?: never;
      })
    | (InquiryBase & {
          status: 'in-review';
          result: InquiryResult;
          decision?: never;
      })
    | (InquiryBase & {
          status: 'decided';
          result: InquiryResult;
          decision: InquiryDecision;
      })
    | (InquiryBase & {
          status: 'deferred';
          reason: string;
          unresolvedQuestions: string[];
          result?: never;
          decision?: never;
      });
