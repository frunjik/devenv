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

// The framed content a ticket owner may edit after creation. An edit replaces all of it, so an
// absent estimate in the new content removes the estimate.
export type TicketContent = Pick<ProblemTicket, 'title' | 'report' | 'problem' | 'scope' | 'estimate'>;

export interface TicketEditEvent {
    kind: 'edit';
    actor: User;
    at: string;
    before: TicketContent;
    after: TicketContent;
}

export type TicketHistoryEvent = TicketChangeEvent | TicketEditEvent;

export type TicketEditResult =
    | { ok: true; event: TicketEditEvent }
    | { ok: false; reason: string };

export type TicketEditOutcome =
    | { ok: true; ticket: StoredTicket; event: TicketEditEvent }
    | { ok: false; kind: 'not-found' }
    | { ok: false; kind: 'stale'; current: StoredTicket }
    | { ok: false; kind: 'refused'; reason: string };
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

export type EstimateRating = 1 | 2 | 3 | 4 | 5;

// Optional on a ticket: a reporter may not be able to estimate yet.
// Each rating runs from 1 (lowest) to 5 (highest); a higher effort means more work.
export interface TicketEstimate {
    impact: EstimateRating;
    urgency: EstimateRating;
    effort: EstimateRating;
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
    estimate?: TicketEstimate;
    // Tickets this one depends on (blocking, not the same problem as "duplicate of", SC-021/SC-047).
    // Directed, many-to-many; existence and cycles are not checked yet.
    dependsOnTicketIds?: ProblemTicketId[];
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

// A decision to reject or defer a note proposal, distinct from acceptance (ImportedNote).
// Kept (not discarded) so the decision and its reasoning remain visible later (2026-10-06, agent
// choice per SC-020, revisable): a rejected proposal is terminal for this slice, a deferred one may
// be revisited. A reason is optional, consistent with this system's other optional free-text fields.
export type NoteReviewOutcome = 'rejected' | 'deferred';

export interface NoteReviewDecision {
    outcome: NoteReviewOutcome;
    reason?: string;
    decidedAt: string;
}

export interface ReviewedNoteProposal {
    proposal: NoteProposal;
    decision: NoteReviewDecision;
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
