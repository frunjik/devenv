# Spike Blueprint: AI-Assisted WMS Authoring

**Status:** Type model drafted; no AI trial or workflow implementation

## Question and Context

Can AI help builders turn incomplete WMS knowledge into a reliable web replacement, while preserving human judgment and continuity?

The Domain is builders' work; the System is AI assisting it. In the supplied scenario, an experienced AI operator retires in about two years and may also hold domain knowledge. Operating AI, building, and validating behavior are distinct roles. The team cannot discover all legacy behavior first. Treat retirement as a continuity constraint, not proof that one person is the sole knowledge source.

## Working Hypothesis

AI may turn incomplete evidence into reviewable target changes. Test whether source links, visible assumptions, human verification, and durable decisions make its help useful and resumable.

## Candidate Terms

| Term | Working meaning |
|---|---|
| **AI Operator** | Person directing AI; may also build or provide expertise. |
| **Builder** | Person changing the target system. |
| **Expectation** | Contextual intended outcome or constraint. |
| **Work Slice** | Bounded behavior and acceptance checks. |
| **AI Proposal** | AI output, not accepted truth. |
| **Verification** | Check against expectations and evidence. |
| **Decision** | Owned outcome and rationale. |
| **Knowledge Gap** | Important uncertainty or uncaptured knowledge. |
| **Continuity Record** | Context that lets others resume work. |

Terms are provisional.

## Candidate Types

The initial TypeScript model is in [`problem-inquiry.types.ts`](../../../projects/shared/src/lib/problem-inquiry.types.ts). Its vertical slice is:

**Problem set (mixed scopes) → inquiry → evidence and findings → insight or target change → human decision.**

The types distinguish operation, workflow, system, and cross-system scope. People, Places, Things, and observed time are context; evidence and findings separate observations from synthesis. AI proposals remain reviewable inputs, not decisions. This is a contract sketch: it does not enforce referential integrity or implement transitions.

## Small Trial

Choose one representative behavior and accessible sources. Before AI use, record expectation, context, evidence, uncertainty, and acceptance checks. Request a bounded interpretation/change and tests, with sources, assumptions, and questions exposed. Have a builder and knowledgeable reviewer independently check it. Record omissions, corrections, effort, decision, and successor needs; test normal and important failure cases. Compare with a similar non-AI task if practical.

Before a live trial, define data/tool access; exclude sensitive production data and unreviewed production changes.

## Decide and Preserve

Assess traceability, correctness, gaps found, review effort, and continuity. Classify **useful**, **conditional**, **not useful**, or **unknown**, with evidence. One slice proves neither autonomous AI capability nor WMS coverage.

Preserve rationale and links to code/tests; retain or discard artifacts with reasons. This blueprint is untested.

Related context: [WMS modernization inquiry](../2026-10-05-warehouse-web-modernization/README.md) and [Candidate WMS model](../2026-10-05-warehouse-web-modernization/domain-model.md).
